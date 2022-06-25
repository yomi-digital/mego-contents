const { ethers, utils } = require("ethers");
const fs = require('fs');

async function main() {
  const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
  const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/' + configs.contract_name + '.sol/' + configs.contract_name + '.json').toString())
  const provider = new ethers.providers.JsonRpcProvider(configs.provider);
  let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
  const contract = new ethers.Contract(configs.contract_address, ABI.abi, wallet)
  const name = 'CONTENTS_NAME'
  const ticker = 'CONTENTS_TICKER'
  const result = await contract.startNewContents(name, ticker)
  const receipt = await result.wait()
  console.log("New contents contract created at:", receipt.events[2].args._contents)
  console.log("💸 Gas used:", receipt.gasUsed.toString())
  configs.contents_address = receipt.events[2].args._contents
  fs.writeFileSync(process.env.CONFIG, JSON.stringify(configs, null, 4))
  const instance = await contract.returnContentsInstance(wallet.address)
  if (instance === receipt.events[2].args._contents) {
    console.log("Confirming instance connected to:", wallet.address)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
