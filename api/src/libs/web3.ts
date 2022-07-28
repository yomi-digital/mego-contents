import { ethers } from "ethers";
import { ABI_FACTORY, ABI_INSTANCE } from "./abi";
import * as Database from "./database";
require('dotenv').config()
const axios = require('axios')
let isParsingContents = false

export const verify = (message, signature) => {
  return new Promise(async (response) => {
    try {
      const verified = await ethers.utils.verifyMessage(message, signature);
      response(verified);
    } catch (e) {
      response(false);
    }
  });
};

export const factoryContract = async () => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER);
  const wallet = new ethers.Wallet(process.env.DUMMY_KEY ?? "").connect(
    provider
  );
  const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS ?? "",
    ABI_FACTORY,
    wallet
  );
  return { contract, wallet, provider, ethers };
};

export const instanceContract = async (instance_address) => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER);
  const wallet = new ethers.Wallet(process.env.DUMMY_KEY ?? "").connect(
    provider
  );
  const contract = new ethers.Contract(
    instance_address,
    ABI_INSTANCE,
    wallet
  );
  return { contract, wallet, provider, ethers };
};

export const parseContent = async (instance_address, content_index) => {
  return new Promise(async response => {
    const instance = await instanceContract(instance_address)
    console.log('[CONTENTS] Parsing content #' + content_index + " in instance:", instance_address)
    const db = new Database.Mongo();
    try {
      const tokenURI = await instance.contract.tokenURI(content_index);
      console.log('[CONTENTS] -> TokenURI is:', tokenURI)
      const owner = await instance.contract.ownerOf(content_index);
      console.log('[CONTENTS] -> Owner is:', owner)
      const freezed = await instance.contract.token_freezed(content_index);
      console.log('[CONTENTS] -> Is freezed?', freezed)
      console.log('[CONTENTS] --> Downloading content from IPFS..')
      const metadata = await axios.get(process.env.PINATA_ENTPOINT + tokenURI.replace('ipfs://', ''))
      // Store or update document
      const checkDB = await db.find('contents', { index: content_index, instance: instance_address })
      if (checkDB === null) {
        let content = {
          instance: instance_address,
          index: content_index,
          owner: owner,
          metadata: metadata.data,
          timestamp: metadata.data.timestamp,
          freezed: freezed
        }
        console.log('[CONTENTS] --> Inserting new content')
        await db.insert('contents', content)
        response(true)
      } else {
        console.log('[CONTENTS] --> Contents exists yet, updating.')
        await db.update('contents', { index: content_index }, { $set: { freezed: freezed, owner: owner, metadata: metadata.data, timestamp: metadata.data.timestamp } })
        response(false)
      }
    } catch (e) {
      response(false)
    }
  })
}

export const parseContents = async () => {
  if (!isParsingContents) {
    isParsingContents = true
    const factoryInstance = await factoryContract()
    const totalInstaces = await factoryInstance.contract.instances_counter()
    console.log("[INSTANCES] -> Parsing " + totalInstaces + " instances to store informations.");
    for (let k = totalInstaces; k >= 1; k--) {
      const instance_index = parseInt(k.toString())
      console.log('[INSTANCES] -> Parsing instance #' + instance_index)
      const contentsAddress = await factoryInstance.contract.instances(instance_index)
      console.log('[INSTANCES] -> Contents instance address is:', contentsAddress)
      const contentsInstance = await instanceContract(contentsAddress)
      const totalSupply = parseInt((await contentsInstance.contract.totalSupply()).toString())
      console.log('[INSTANCES] -> Found ' + totalSupply + ' contents, starting parse.')
      for (let j = 1; j <= totalSupply; j++) {
        await parseContent(contentsAddress, j)
      }
    }
    console.log('[INSTANCES] -> Parsing finished.')
    isParsingContents = false
    return true
  } else {
    return false
  }
};

export const listenEvents = async () => {
  const instance = await factoryContract()
  console.log('Setting up on-chain event listeners..')
  instance.contract.on("ContentCreated", async (instance, index) => {
    console.log("[EVENT] Content created")
    const content_index = parseInt(index.toString())
    parseContent(instance, content_index)
  })
  instance.contract.on("ContentFixed", async (instance, index) => {
    console.log("[EVENT] Content fixed")
    const content_index = parseInt(index.toString())
    parseContent(instance, content_index)
  })
  instance.contract.on("ContentFreezed", async (instance, index) => {
    console.log("[EVENT] Content freezed")
    const content_index = parseInt(index.toString())
    parseContent(instance, content_index)
  })
};