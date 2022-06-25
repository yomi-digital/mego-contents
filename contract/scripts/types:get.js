const { ethers, utils } = require("ethers");
const fs = require('fs');

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/MEGO_Contents.sol/MEGO_Contents.json').toString())
    const ABI_F = JSON.parse(fs.readFileSync('./artifacts/contracts/MEGO_Factory.sol/MEGO_Factory.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contents_address, ABI.abi, wallet)
    const contract_F = new ethers.Contract(configs.contract_address, ABI_F.abi, wallet)
    let exists = true
    let i = 0
    while (exists) {
        try {
            const result = await contract.content_models(i)
            if (result.length > 0) {
                let datatypes = []
                console.log("Model found:", result)
                let finished = false
                let t = 0
                while (!finished) {
                    const datatype = await contract_F.returnModelType(result, t)
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
                    t++
                    if (datatype._name.length === 0) {
                        finished = true
                    }
                }
                console.log(datatypes)
            }
            i++
        } catch (e) {
            exists = false
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
