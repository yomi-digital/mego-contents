const { ethers, utils } = require("ethers");
const fs = require('fs');

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/' + configs.contract_name + '.sol/' + configs.contract_name + '.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    // Drop with secondary wallet
    let secondary = new ethers.Wallet.fromMnemonic(configs.owner_mnemonic, "m/44'/60'/0'/0/5").connect(provider)
    const contract = new ethers.Contract(configs.contract_address, ABI.abi, secondary)

    console.log('Getting instances..')
    const instances = await contract.instancesOfOwner(secondary.address)
    console.log("Deployed instances:", instances)
    const instance = instances[0]
    console.log('Minting NFT..')
    const metadata = 'bafkreiex3numrx6e54p74cqlrwz55y242li3fge2mwsrwzvedgfajbmg7u'
    const model = "blog"
    const result = await contract.dropContent(instance, metadata, model)
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
