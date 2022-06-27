const { ethers, utils } = require("ethers");
const fs = require('fs');
const { generate, derive } = require('../libs/address_generator')

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/MEGO_Contents.sol/MEGO_Contents.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contents_address, ABI.abi, wallet)
    
    const model = "blog"
    const totalSupply = await contract.minted_tokens(model)
    console.log('TOTAL SUPPLY IS: ' + totalSupply)
    const tokensOfModel = await contract.tokensOfModel(wallet.address, model)
    for (let k in tokensOfModel) {
        const metadata = await contract.tokenURI(tokensOfModel[k])
        console.log("Token with id:", tokensOfModel[k].toString(), "is:", metadata)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
