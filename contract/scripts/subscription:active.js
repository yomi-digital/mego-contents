const { ethers, utils } = require("ethers");
const fs = require('fs');

async function main() {
  const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
  const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/' + configs.contract_name + '.sol/' + configs.contract_name + '.json').toString())
  const provider = new ethers.providers.JsonRpcProvider(configs.provider);
  let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
  const contract = new ethers.Contract(configs.contract_address, ABI.abi, wallet)

  const subscription_active = await contract.isSubscriptionActive(wallet.address)
  console.log("Subscription is:", subscription_active)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
