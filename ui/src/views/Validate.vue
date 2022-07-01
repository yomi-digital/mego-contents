<template>
  <div class="home">
    <div v-if="!loading">
      <div v-if="!owner">
        <div v-if="toValidate.length > 0">
          <div
            v-for="draft in toValidate"
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
        <div v-if="toValidate.length === 0">
          Nothing to validate, wait for some content first.
        </div>
      </div>
      <div v-if="owner">Only the owner can validate nfts.</div>
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
const abi = require("../abis/factory.json");

export default {
  name: "toValidate",
  data() {
    return {
      infuraId: process.env.VUE_APP_INFURA_ID,
      umiUrl: process.env.VUE_APP_UMI_API,
      axios: axios,
      abi: abi,
      contract: process.env.VUE_APP_UMI_CONTRACT,
      network: parseInt(process.env.VUE_APP_CHAIN_ID),
      web3: {},
      account: "",
      toValidate: [],
      loading: true,
      owner: false,
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
            const nftContract = new web3.eth.Contract(app.abi, app.contract);
            const contractOwner = await nftContract.methods.owner().call();
            if (contractOwner === app.account) {
              const owned = await nftContract.methods
                .tokensOfOwner(app.account)
                .call();
              console.log("Owned nfts?", owned);
              for (let k in owned) {
                let tokenURI = await nftContract.methods
                  .tokenURI(owned[k])
                  .call();
                console.log("TOKEN URI FOR #" + owned[k] + ":", tokenURI);
                const content = await app.axios.get(
                  tokenURI.replace(
                    "ipfs://",
                    "https://ipfs.yomi.digital/ipfs/"
                  )
                );
                content.data.tokenId = owned[k];
                app.toValidate.push(content.data);
              }
            } else {
              app.owner = true;
              app.log("danger", "Only the owner can validate!");
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
