<template>
  <div class="home">
    <div class="instances_container" style="margin-top:-1rem">
      <div class="instance_info">
        <h2 v-if="loading || (!loading && Object.keys(content).length !== 0)">PUBLIC</h2>
        <h2 v-if="!loading && Object.keys(content).length === 0">NFT NOT FOUND</h2>
        <p v-if="!loading && Object.keys(content).length !== 0">
          <span class="mr-6">Headless endpoint: <a :href="contents_api+'/contents/'+instance+'/'+tokenId" target="_blank">api.mego.cx/c...{{instance.substr(-3)}}</a></span>
          <a style="text-decoration: underlined;color: black;font-size: 18px;" class="mr-3"
            @click="copyText('link','/share/'+instance+'/'+tokenId)">
            <font-awesome-icon icon="fa-solid fa-link" style="font-size:16px;margin-top: .2rem;" class="mt-5" />
            share
          </a>
          <b-button type="button" class="button-light is-dark mx-3 mt-4"
            style="color:black!important;border:1px solid black!important"
            @click="openTab(opensea_url+'/'+instance+'/'+tokenId)">
            SEE ON OPENSEA
          </b-button>
        </p>
      </div>
      <div v-if="loading">Syncing state with blockchain, please wait..</div>
      <div class="project_container" v-if="!loading && Object.keys(content).length !== 0">
        <div class="img_container">
          <div
            :style="'background-image: url('+content.image.replace('ipfs://', 'https://ipfs.yomi.digital/ipfs/')+')'">
          </div>
        </div>
        <div class="body_container">
          <h1 v-html="content.name"></h1>
          <h2>by <i @click="openTab(explorer_url+'/address/'+content.author)" v-html="content.author"></i></h2>
          <div v-for="key in Object.keys(content)" :key="key" class="body my-4">
            <template
              v-if="key !== 'name' && key !== 'title' && key !== 'author' && key !== 'category' && key !== 'timestamp'">
              <h4 v-html="key"></h4>
              <p v-html="content[key]" v-if="key != 'image'"></p>
              <img style="width:700px;margin-top: 1rem;"
                :src="content['image'].replace('ipfs://', 'https://ipfs.yomi.digital/ipfs/')" alt=""
                v-if="key == 'image'">
            </template>
          </div>
        </div>
      </div>
      <b-button type="button" class="button-dark is-light"
        style="background:#111!important;color:white!important;width:120px;margin-top: -2rem;"
        v-if="!loading && Object.keys(content).length === 0" @click="$router.push({name:'Public'})">
        GO BACK
      </b-button>
    </div>
    <div v-if="isWorking" style="padding: 20px 0; text-align: center">
      {{ workingMessage }}
    </div>
  </div>
</template>
<style>
.home {
  padding: 30px;
}

.input {
  border-radius: 0px;
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
  name: "View",
  data() {
    return {
      infuraId: process.env.VUE_APP_INFURA_ID,
      umiUrl: process.env.VUE_APP_UMI_API,
      axios: axios,
      abi_factory: abi_factory,
      abi_contents: abi_contents,
      contract: process.env.VUE_APP_FACTORY_CONTRACT,
      opensea_url: process.env.VUE_APP_OPENSEA_URL,
      contents_api: process.env.VUE_APP_CONTENTS_API,
      explorer_url: process.env.VUE_APP_EXPLORER_URL,
      instance: "",
      network: parseInt(process.env.VUE_APP_CHAIN_ID),
      datatypes: {},
      web3: {},
      account: "",
      content: {},
      stored: {},
      category: "",
      isWorking: false,
      loading: true,
      workingMessage: "",
      tokenId: "",
      freezed: false
    };
  },
  async mounted() {
    document.getElementsByClassName('home')[0].style.background = 'white'
    document.getElementById('navbar_group').children[1].style.background = 'white'
    const app = this;
    app.tokenId = app.$route.params.tokenId;
    await app.connect();
    if (!app.freezed && Object.keys(app.content).length !== 0) {
      app.$router.push({ name: 'Manage', params: { tokenId: app.tokenId } })
    }
    setInterval(function () {
      app.$forceUpdate();
    }, 100);
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
    log(type, content) {
      this.$buefy.snackbar.open({
        type: "is-" + type,
        message: content,
        pauseOnHover: true,
      });
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
      let tokenURI = await contentsContract.methods
        .tokenURI(app.tokenId)
        .call();
      app.freezed = await contentsContract.methods
        .metadata_freezed(tokenURI.replace("ipfs://", ""))
        .call();
      console.log("TOKEN URI IS:", tokenURI);
      try {
        const content = await app.axios.get(
          tokenURI.replace("ipfs://", "https://ipfs.yomi.digital/ipfs/")
        );
        app.content = content.data
      }
      catch {
        app.content = {}
      }
      app.loading = false;
    },
    openTab(link) {
      window.open(link, '_blank')
    },
    copyText(type, text) {
      if (type === 'link') {
        text = location.href.split('#')[0] + '#' + text
        navigator.clipboard.writeText(text);
        setTimeout(() => { this.openTab(text) }, 1000)
      }
      else {
        navigator.clipboard.writeText(text);
      }
      this.log('success', type + ' copied!')
    }
  },
};
</script>
