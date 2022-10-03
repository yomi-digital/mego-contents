import { ethers } from "ethers";
import { ABI_FACTORY, ABI_INSTANCE } from "./abi";
import * as Database from "./database";
import { chains } from '../chains'
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

export const factoryContract = async (providerUrl, contractAddress) => {
  const provider = new ethers.providers.JsonRpcProvider(providerUrl);
  const wallet = new ethers.Wallet(process.env.DUMMY_KEY ?? "").connect(
    provider
  );
  const contract = new ethers.Contract(
    contractAddress ?? "",
    ABI_FACTORY,
    wallet
  );
  return { contract, wallet, provider, ethers };
};

export const instanceContract = async (providerUrl, instance_address) => {
  const provider = new ethers.providers.JsonRpcProvider(providerUrl);
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

export const parseContent = async (chain, instance_address, content_index) => {
  return new Promise(async response => {
    const instance = await instanceContract(chains[chain].provider, instance_address)
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
      const checkDB = await db.find('contents', { chain: chain, index: content_index, instance: instance_address })
      if (checkDB === null) {
        let content = {
          chain: chain,
          instance: instance_address,
          index: content_index,
          owner: owner,
          metadata: metadata.data,
          timestamp: metadata.data.timestamp,
          tokenURI: tokenURI,
          freezed: freezed
        }
        console.log('[CONTENTS] --> Inserting new content')
        await db.insert('contents', content)
        response(true)
      } else {
        console.log('[CONTENTS] --> Contents exists yet, updating.')
        let changed
        if (checkDB.changed === undefined) {
          changed = 1
        } else {
          changed = checkDB.changed + 1
        }
        await db.update('contents', { chain: chain, index: content_index, instance: instance_address }, { $set: { freezed: freezed, owner: owner, metadata: metadata.data, last_change: metadata.data.timestamp, changed, tokenURI: tokenURI } })
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
    for (const chain of Object.keys(chains)) {
      console.log("[INSTANCES] -> Parsing "+chain+" factory contract")
      const factoryInstance = await factoryContract(chains[chain].provider, chains[chain].contract)
      const totalInstaces = await factoryInstance.contract.instances_counter()
      console.log("[INSTANCES] -> Parsing " + totalInstaces + " instances of "+chains[chain].contract+" to store informations.");
      for (let k = totalInstaces; k >= 1; k--) {
        const instance_index = parseInt(k.toString())
        console.log('[INSTANCES] -> Parsing instance #' + instance_index)
        const contentsAddress = await factoryInstance.contract.instances(instance_index)
        console.log('[INSTANCES] -> Contents instance address is:', contentsAddress)
        const contentsInstance = await instanceContract(chains[chain].provider, contentsAddress)
        const totalSupply = parseInt((await contentsInstance.contract.totalSupply()).toString())
        console.log('[INSTANCES] -> Found ' + totalSupply + ' contents, starting parse.')
        for (let j = 1; j <= totalSupply; j++) {
          await parseContent(chain, contentsAddress, j)
        }
      }
    }
    console.log('[INSTANCES] -> Parsing finished.')
    isParsingContents = false
    return true
  } else {
    return false
  }
};

export const updateUser = async (chain, instance_address, user, state) => {
  return new Promise(async response => {
    const db = new Database.Mongo();
    try {
      // Store or update document
      const checkDB = await db.find('users', { chain: chain, instance: instance_address, address: user })
      if (checkDB === null) {
        let newUser = {
          chain: chain,
          instance: instance_address,
          address: user,
          state: state
        }
        console.log('[CONTENTS] --> Inserting new user ', user)
        await db.insert('users', newUser)
        response(true)
      } else {
        await db.update('users', { chain: chain, instance: instance_address, address: user }, { $set: { state: state } })
        response(true)
      }
    } catch (e) {
      response(false)
    }
  })
}

export const listenEvents = async () => {
  for (const chain of Object.keys(chains)) {
    const instance = await factoryContract(chains[chain].provider, chains[chain].contract)
    console.log('Setting up ' + chain + ' on-chain event listeners..')
    instance.contract.on("ContentCreated", async (instance, index) => {
      console.log("[EVENT] Content created")
      const content_index = parseInt(index.toString())
      parseContent(chain, instance, content_index)
    })
    instance.contract.on("ContentFixed", async (instance, index) => {
      console.log("[EVENT] Content fixed")
      const content_index = parseInt(index.toString())
      parseContent(chain, instance, content_index)
    })
    instance.contract.on("ContentFreezed", async (instance, index) => {
      console.log("[EVENT] Content freezed")
      const content_index = parseInt(index.toString())
      parseContent(chain, instance, content_index)
    })
    instance.contract.on("UserAdded", async (instance, user) => {
      console.log("[EVENT] User Added")
      updateUser(chain, instance, user, true)
    })
    instance.contract.on("UserRemoved", async (instance, user) => {
      console.log("[EVENT] User Removed")
      updateUser(chain, instance, user, false)
    })
  }
};