const { ethers, utils } = require("ethers");
const fs = require('fs');

async function main() {
  const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
  const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/' + configs.contract_name + '.sol/' + configs.contract_name + '.json').toString())
  const provider = new ethers.providers.JsonRpcProvider(configs.provider);
  let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
  const contract = new ethers.Contract(configs.contract_address, ABI.abi, wallet)

  const subscription = await contract.subscriptions(wallet.address)
  const subscription_before = await contract.isSubscriptionActive(wallet.address)
  console.log("Subscription before buy is:", subscription_before)
  const price = await contract.monthly_prices(subscription)
  console.log("Price for monthly subscription is:", price.toString(), "wei")
  const result = await contract.payMonthlyFee({ value: price })
  const receipt = await result.wait()
  console.log("💸 Gas used:", receipt.gasUsed.toString())
  const subscription_after = await contract.isSubscriptionActive(wallet.address)
  console.log("Subscription before after is:", subscription_after)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
