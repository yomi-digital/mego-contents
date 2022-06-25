<template>
  <div id="app">
    <div v-if="account && !checking">
      <div class="bar">
        <a href="#">MEGO</a> |
        <a href="/">NEW</a>
        <a href="/#/drafts">DRAFTS</a>
        <a href="/#/validate">VALIDATE</a>
        <a href="/#/public">PUBLIC</a>
        <a href="#" style="float: right; margin-top: 2px"
          >{{ account.substr(0, 5) }}...{{ account.substr(-5) }}</a
        >
      </div>
      <router-view />
    </div>
    <div v-if="!account" style="padding: 35vh 0; text-align: center">
      <h1 class="title is-2">MEGO Contents</h1>
      <h2 class="title is-3">Please connect your wallet first.</h2>
      <b-button v-if="!checking" @click="connect">CONNECT WALLET</b-button>
      <div v-if="checking">Checking if you can interact with contract..</div>
    </div>
  </div>
</template>

<style>
#app,
.button, .input {
  font-family: "JetBrains Mono", monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  font-size: 13px;
}
.button{
  border-color:#000!important;
  border-radius:0!important;
}
.bar {
  text-align: left;
  padding: 10px;
  border-bottom: 1px solid #2c3e50;
}
.bar a {
  font-weight: bold;
  color: #000;
  margin: 0 10px;
  font-size: 13px;
}
.bar a:hover {
  border-bottom: 1px solid #000;
}
</style>

<script>
import Web3 from "web3";
import axios from "axios";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
const abi = require("./abi.json");
export default {
  name: "Home",
  data() {
    return {
      infuraId: process.env.VUE_APP_INFURA_ID,
      umiUrl: process.env.VUE_APP_UMI_API,
      network: parseInt(process.env.VUE_APP_CHAIN_ID),
      axios: axios,
      abi: abi,
      contract: process.env.VUE_APP_UMI_CONTRACT,
      account: "",
      checking: false,
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
      try {
        const network = await web3.eth.net.getId();
        console.log("Found network:", network);
        if (network === app.network) {
          const accounts = await web3.eth.getAccounts();
          if (accounts.length > 0) {
            app.checking = true;
            const nftContract = new web3.eth.Contract(app.abi, app.contract);
            const isMinter = await nftContract.methods
              .isMinter(accounts[0])
              .call();
            console.log("Is minter?", isMinter);
            if (isMinter) {
              app.checking = false;
              app.account = accounts[0];
            } else {
              app.checking = false;
              alert("You don't have administrative rights!");
            }
          } else {
            alert("No accounts allowed, please retry!");
          }
        } else {
          alert(
            "Wrong network, please connect to correct one (" +
              app.network +
              ")!"
          );
        }
      } catch (e) {
        app.checking = false;
        alert(e.message);
      }
    },
  },
};
</script>
