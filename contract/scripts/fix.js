const { ethers, utils } = require("ethers");
const fs = require('fs');

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/' + configs.contract_name + '.sol/' + configs.contract_name + '.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contract_address, ABI.abi, wallet)
    
    console.log('Getting instances..')
    const instances = await contract.instancesOfOwner(wallet.address)
    console.log("Deployed instances:", instances)
    const instance = instances[0]

    const metadata = 'IPFS_HASH_FIXED'
    const tokenId = 1
    const result = await contract.fixContent(instance, tokenId, metadata)
    const receipt = await result.wait()
    console.log(receipt)
    console.log("💸 Gas used:", receipt.gasUsed.toString())
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
