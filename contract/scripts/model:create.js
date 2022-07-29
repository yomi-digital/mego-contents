const { ethers, utils } = require("ethers");
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/MEGO_Factory.sol/MEGO_Factory.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contract_address, ABI.abi, wallet)
    const models = ["blog", "nft"]
    for (let k in models) {
        try {
            const result = await contract.createModel(models[k])
            const receipt = await result.wait()
            console.log(receipt)
            console.log("💸 Gas used:", receipt.gasUsed.toString())
        } catch (e) {
            console.log("Can't create " + models[k])
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
