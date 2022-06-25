const { ethers, utils } = require("ethers");
const fs = require('fs');

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/MEGO_Contents.sol/MEGO_Contents.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contents_address, ABI.abi, wallet)

    const models = ["blog", "artists"]
    for (let k in models) {
        try {
            const result = await contract.addType(models[k])
            const receipt = await result.wait()
            console.log(receipt)
            console.log("💸 Gas used:", receipt.gasUsed.toString())
        } catch (e) {
            console.log("Can't add type.")
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
