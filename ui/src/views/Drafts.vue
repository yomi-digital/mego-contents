<template>
  <div class="home">
    <div v-if="!loading">
      <div v-if="drafts.length > 0">
        <div
          v-for="draft in drafts"
          v-bind:key="draft.tokenId"
          class="cms-content"
        >
          <h3 class="title is-4">{{ draft.name }}</h3>
          {{ draft.category }}<br />
          {{ draft.summary }}
          <a
            :href="'/#/manage/' + draft.tokenId"
            style="position: absolute; bottom: 10px; right: 10px"
            >-></a
          >
        </div>
      </div>
      <div v-if="drafts.length === 0">
        No drafts, start create some content first.
      </div>
    </div>
    <div v-if="loading">Loading data from blockchain, please wait..</div>
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
      datatypes: [],
      loading: true,
    };
  },
  mounted() {
    this.connect();
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
            const factoryContract = new app.web3.eth.Contract(
              app.abi_factory,
              app.contract
            );
            const instances = await factoryContract.methods
              .instancesOfOwner(app.account)
              .call();
            console.log("Deployed instances:", instances);
            app.instance = instances[0];
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
            app.loading = false;
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
      app.loading = false;
    },
    log(type, content) {
      this.$buefy.snackbar.open({
        type: "is-" + type,
        message: content,
        pauseOnHover: true,
      });
    },
  },
};
</script>
