<template>
  <div id="drafts" class="public">
    <div class="instances_container">
      <div class="instance_info">
        <h2>Instance users</h2>
      </div>
    </div>
  </div>
</template>


<script>
  import Web3 from "web3";
  import axios from "axios";
  import Web3Modal from "web3modal";
  import WalletConnectProvider from "@walletconnect/web3-provider";
  const abi_factory = require("../abis/factory.json");
  const abi_contents = require("../abis/contents.json");

  export default {
    name: "Drafts",
    data() {
      return {
        infuraId: process.env.VUE_APP_INFURA_ID,
        umiUrl: process.env.VUE_APP_UMI_API,
        axios: axios,
        abi_factory: abi_factory,
        abi_contents: abi_contents,
        contract: process.env.VUE_APP_FACTORY_CONTRACT,
        instance: "",
        network: parseInt(process.env.VUE_APP_CHAIN_ID),
        web3: {},
        account: "",
        drafts: [],
        originalDrafts: [],
        datatypes: [],
        loading: true,
        filterActive: 'title',
        models: []
      };
    },
    async mounted() {
      document.getElementById('navbar_group').children[1].style.background = 'white'
      document.getElementById('app').style.background = 'white'
      await this.connect();
      this.originalDrafts = this.drafts
      this.$forceUpdate()
      this.loading = false
      //Removing extra loading element
      let tempInterval = setInterval(() => {
        if(document.getElementById('draft_extra_loading')) {
          document.getElementById('draft_extra_loading').remove()
          clearInterval(tempInterval)
        }
      },500)
    },
    watch: {
      filterActive: {
        handler() {
          if (!this.loading) {
            let drafts = this.originalDrafts
            console.log(this.drafts)
            if (this.filterActive === 'title') {
              drafts.sort(function (a, b) {
                if (a.name.toLowerCase() < b.name.toLowerCase()) {
                  return -1;
                }
                if (a.name.toLowerCase() > b.name.toLowerCase()) {
                  return 1;
                }
                return 0;
              })
            } else if (this.filterActive === 'date') {
              drafts.sort(function (a, b) {
                return b.timestamp - a.timestamp;
              })
            } else if (this.filterActive === 'type') {
              drafts.sort(function (a, b) {
                if (a.category.toLowerCase() < b.category.toLowerCase()) {
                  return -1;
                }
                if (a.category.toLowerCase() > b.category.toLowerCase()) {
                  return 1;
                }
                return 0;
              })
            }
            this.drafts = []
            this.drafts = drafts
          }
        }
      }
    },
    methods: {
      async connect() {
        const app = this;
        const web3Modal = new Web3Modal({
          cacheProvider: true,
          providerOptions: {
            walletconnect: {
              package: WalletConnectProvider,
              options: {
                infuraId: app.infuraId,
              },
            },
          },
        });
        const provider = await web3Modal.connect();
        const web3 = await new Web3(provider);
        app.web3 = web3;
        const network = await web3.eth.net.getId();
        console.log("Found network:", network);
        if (network === app.network) {
          try {
            const accounts = await web3.eth.getAccounts();
            if (accounts.length > 0) {
              app.account = accounts[0];
              app.instance = localStorage.getItem("instance");
              await app.fetchModels();
              let loadingEl = document.getElementById('draft_list_loading')?.children[1]?.cloneNode(true)
              loadingEl?.setAttribute('id', 'draft_extra_loading')
              const contentsContract = new web3.eth.Contract(
                app.abi_contents,
                app.instance
              );
              for(const model of app.models) {
                const owned = await contentsContract.methods
                  .tokensOfModel(app.account, model)
                  .call();
                for (let k in owned) {
                  let tokenURI = await contentsContract.methods
                    .tokenURI(owned[k])
                    .call();
                  const freezed = await contentsContract.methods
                    .metadata_freezed(tokenURI.replace("ipfs://", ""))
                    .call();
                  console.log("Metadata is freezed?", freezed);
                  if (freezed) {
                    console.log("TOKEN URI FOR #" + owned[k] + ":", tokenURI);
                    try {
                      const content = await app.axios.get(
                        tokenURI.replace(
                          "ipfs://",
                          "https://ipfs.yomi.digital/ipfs/"
                        ) 
                      );
                      content.data.tokenId = owned[k];
                      console.log(owned[k])
                      app.drafts.push(content.data);
                      //spawn extra loading element to fill empty space
                      setTimeout(() => {document.getElementById('draft_list')?.append(loadingEl)},100)
                    } catch (e) {
                      console.log("Can't download from IPFS..");
                    }
                  }
                }
              }
            } else {
              alert("No accounts allowed, please retry!");
            }
          } catch (e) {
            alert(e.message);
          }
        } else {
          alert(
            "Wrong network, please connect to correct one (" + app.network + ")!"
          );
        }
      },
      async fetchModels() {
        const app = this;
        const factoryContract = new app.web3.eth.Contract(
          app.abi_factory,
          app.contract
        );
        let ended = false
        let k = 0
        while (!ended) {
          try {
            const created = await factoryContract.methods.created(k).call()
            let sign = created.split('__')[0]
            if(app.account.substr(0, 5) + app.account.substr(-3) === sign) {
              app.models.push(created)
            }
            k++
            if (created.length === 0) {
              ended = true
            }
          } catch (e) {
            ended = true
          }
        }
      },
      log(type, content) {
        this.$buefy.snackbar.open({
          type: "is-" + type,
          message: content,
          pauseOnHover: true,
        });
      }
    },
  };
</script>
