const { ethers, utils } = require("ethers");
const fs = require('fs');
const { generate, derive } = require('../libs/address_generator')

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/MEGO_Contents.sol/MEGO_Contents.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contents_address, ABI.abi, wallet)
    // Scanning al console
    const totalSupply = await contract.totalSupply()
    console.log('TOTAL SUPPLY IS: ' + totalSupply)
    let ended = false
    let i = 1
    let errors = 0
    while (!ended) {
        try {
            const owner = await contract.ownerOf(i)
            const uri = await contract.tokenURI(i)
            console.log('TOKENID: ' + i, 'OWNER IS', owner)
            console.log(uri)
            const nftType = await contract.nfts_type(i)
            console.log("Nft type:", nftType.toString())
            const isPremium = await contract.isPremium(owner)
            console.log("Is premium?", isPremium)
            console.log('--')
            i++
            errors = 0
        } catch (e) {
            if (i === 1) {
                console.log('No tokens found.')
            }
            i++
            errors++
            if (errors > 1) {
                ended = true
            }
        }
    }

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
