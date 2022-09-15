<template>
  <div id="drafts">
    <div class="instances_container">
      <div class="instance_info">
        <h2>DRAFTS</h2>
      </div>
      <div class="columns">
        <div class="column drafts_filters">
          <p style="font-weight: 700;color: #6F706F;margin-bottom: 1.9rem;cursor: inherit;">filters</p>
          <p @click="filterActive = 'title'" :style="(filterActive === 'title') ? 'font-weight:600' : ''">title</p>
          <p @click="filterActive = 'date'" :style="(filterActive === 'date') ? 'font-weight:600' : ''">date</p>
          <p @click="filterActive = 'type'" :style="(filterActive === 'type') ? 'font-weight:600' : ''">type</p>
        </div>
        <div class="column is-two-thirds">
          <div class="draft_list" v-if="!loading && drafts.length > 0">
            <div class="draft" v-for="(draft,index) in drafts" :key="index"
              @click="$router.push({name: 'Manage', params: {tokenId: draft.tokenId+1}})">
              <div>
                <div :style="'background: url(https://ipfs.yomi.digital/ipfs/'+draft.image.split('//')[1]+')'">
                </div>
                <h3 v-html="draft.name"></h3>
              </div>
              <p v-html="draft.description"></p>
              <img src="../assets/images/draft_arrow.svg">
            </div>
          </div>
          <div class="draft_list" style="position:relative" v-if="loading">
            <div class="instances_loading" style="opacity:.9">
              <font-awesome-icon icon="fa-solid fa-circle-notch" style="font-size:25px" class="fa-spin" />
            </div>
            <div class="draft" v-for="i in 6" :key="i">
              <div>
                <div class="loading_box" style="opacity:.7"></div>
                <h3>
                  <div class="loading_box" style="opacity:.8;width: 120px;height:20px"></div>
                </h3>
              </div>
              <div class="loading_box" style="margin: 1rem 0 0 0!important; width: 100%;height: 8px; opacity: .5;">
              </div>
              <div class="loading_box" style="margin: .2rem 0 0 0!important; width: 100%;height: 8px; opacity: .5;">
              </div>
              <div class="loading_box"
                style="margin: .2rem 0 .2rem .1rem!important; width: 60%;height: 8px; float: left; opacity: .5;"></div>
              <div class="loading_box"
                style="margin: .2rem 0 .2rem .1rem!important; width: 30%;height: 8px; float: left; opacity: .5;"></div>
              <div class="loading_box" style="margin: .4rem 0 0 0!important; width: 80%;height: 8px; opacity: .5;">
              </div>
              <img src="../assets/images/draft_arrow.svg" style="opacity:.7">
            </div>
          </div>
          <div class="mx-auto my-2" style="display:grid;place-items:center" v-if="!loading && drafts.length === 0">
            <p>You have no drafts at the moment</p>
            <b-button type="button" class="button-dark is-light mx-3 mt-5"
              style="background:#111!important;color:white!important" @click="$router.push({name: 'New'})">
              CREATE NOW
            </b-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
  .cms-content {
    padding: 20px;
    border: 1px solid #000;
    border-radius: 2px;
    width: 30%;
    display: inline-block;
    position: relative;
  }
</style>

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
        filterActive: 'title'
      };
    },
    async mounted() {
      document.getElementById('navbar_group').children[1].style.background = 'white'
      document.getElementById('app').style.background = 'white'
      await this.connect();
      this.drafts.forEach((el, i) => {
        el.tokenId = i
      })
      this.originalDrafts = this.drafts
      this.loading = false
    },
    watch: {
      filterActive: {
        handler() {
          if (!this.loading) {
            let drafts = this.originalDrafts
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
              app.fetchModels();
              const contentsContract = new web3.eth.Contract(
                app.abi_contents,
                app.instance
              );
              const owned = await contentsContract.methods
                .tokensOfModel(app.account, "blog")
                .call();
              console.log("Nft of model?", owned);
              console.log(owned);
              for (let k in owned) {
                let tokenURI = await contentsContract.methods
                  .tokenURI(owned[k])
                  .call();
                const freezed = await contentsContract.methods
                  .metadata_freezed(tokenURI.replace("ipfs://", ""))
                  .call();
                console.log("Metadata is freezed?", freezed);
                if (!freezed) {
                  console.log("TOKEN URI FOR #" + owned[k] + ":", tokenURI);
                  try {
                    const content = await app.axios.get(
                      tokenURI.replace(
                        "ipfs://",
                        "https://ipfs.yomi.digital/ipfs/"
                      )
                    );
                    content.data.tokenId = owned[k];
                    app.drafts.push(content.data);
                  } catch (e) {
                    console.log("Can't download from IPFS..");
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
        const contentsContract = new app.web3.eth.Contract(
          app.abi_contents,
          app.instance
        );
        const factoryContract = new app.web3.eth.Contract(
          app.abi_factory,
          app.contract
        );
        let exists = true;
        let i = 0;
        while (exists) {
          try {
            const result = await contentsContract.methods
              .content_models(i)
              .call();
            if (result.length > 0) {
              app.datatypes[result] = [];
              if (app.category.length === 0) {
                app.category = result;
              }
              let datatypes = [];
              console.log("Model found:", result);
              let finished = false;
              let t = 0;
              while (!finished) {
                const datatype = await factoryContract.methods
                  .returnModelType(result, t)
                  .call();
                if (datatype._active) {
                  if (datatype._input !== "file") {
                    app.content[datatype._name] = "";
                  } else {
                    app.content[datatype._name] = {};
                  }
                  datatypes.push({
                    name: datatype._name,
                    print: datatype._print,
                    required: datatype._required,
                    multiple: datatype._multiple,
                    input: datatype._input,
                    specs: datatype._specs,
                  });
                }
                t++;
                if (datatype._name.length === 0) {
                  finished = true;
                }
              }
              app.datatypes[result] = datatypes;
            }
            i++;
          } catch (e) {
            console.log("Model parse finished.");
            exists = false;
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
