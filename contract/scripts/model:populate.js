const { ethers, utils } = require("ethers");
const fs = require('fs');

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/MEGO_Factory.sol/MEGO_Factory.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contract_address, ABI.abi, wallet)

    const types = {
        "blog": [
            {
                active: true,
                name: "name",
                print: true,
                required: true,
                multiple: false,
                input: "text",
                specs: ""
            },
            {
                active: true,
                name: "description",
                print: true,
                required: true,
                multiple: false,
                input: "textarea",
                specs: "plain"
            },
            {
                active: true,
                name: "body",
                print: true,
                required: true,
                multiple: false,
                input: "textarea",
                specs: ""
            },
            {
                active: true,
                name: "type",
                print: true,
                required: true,
                multiple: false,
                input: "select",
                specs: "[BLOG,NEWS,RANDOM]"
            },
            {
                active: true,
                name: "tag",
                print: true,
                required: false,
                multiple: false,
                input: "tag",
                specs: ""
            },
            {
                active: true,
                name: "image",
                print: true,
                required: true,
                multiple: false,
                input: "file",
                specs: ""
            }
        ],
        "nft": [
            {
                active: true,
                name: "name",
                print: true,
                required: true,
                multiple: false,
                input: "text",
                specs: ""
            },
            {
                active: true,
                name: "description",
                print: true,
                required: true,
                multiple: false,
                input: "textarea",
                specs: "plain"
            },
            {
                active: true,
                name: "image",
                print: true,
                required: true,
                multiple: false,
                input: "file",
                specs: ""
            }
        ]
    }

    for (let model in types) {
        for (let k in types[model]) {
            const type = types[model][k]
            console.log('Adding ' + type.name + ' in ' + model + '..')
            try {
                const result = await contract.editDatatypeInModel(model, k, type.active, type.name, type.print, type.required, type.multiple, type.input, type.specs)
                const receipt = await result.wait()
                console.log(receipt)
                console.log("💸 Gas used:", receipt.gasUsed.toString())
            } catch (e) {
                console.log("Can't add.")
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
