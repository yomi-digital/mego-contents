const { ethers, utils } = require("ethers");
const fs = require('fs');

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/' + configs.contract_name + '.sol/' + configs.contract_name + '.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contract_address, ABI.abi, wallet)

    const types_instance = await contract.returnTypesInstance()
    console.log('Types instance is:', types_instance)

    let ended = false
    let k = 0
    while (!ended) {
        try {
            const created = await contract.created(k)
            console.log('Type #' + k, created)
            k++
            if (created.length === 0) {
                ended = true
            }
        } catch (e) {
            ended = true
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
