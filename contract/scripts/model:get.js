const { ethers, utils } = require("ethers");
const fs = require('fs');

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/MEGO_Factory.sol/MEGO_Factory.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contract_address, ABI.abi, wallet)

    const model = "blog"
    const state = await contract.models(model)
    console.log("Checking state for " + blog + ":", state)
    let datatypes = []
    let finished = false
    let i = 0
    while (!finished) {
        const datatype = await contract.returnModelType(model, i)
        if (datatype._active) {
            datatypes.push({
                name: datatype._name,
                print: datatype._print,
                required: datatype._required,
                multiple: datatype._multiple,
                input: datatype._input,
                specs: datatype._specs
            })
        }
        if (datatype._name.length === 0) {
            finished = true
        }
        i++
    }
    console.log(datatypes)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
