<template>
  <div id="app">
    <div v-if="account && !checking && instance.length > 0">
      <div class="bar">
        <a href="/">MEGO</a> |
        <a href="/#/new">NEW</a>
        <a href="/#/drafts">DRAFTS</a>
        <a href="/#/public">PUBLIC</a>
        <a href="#" style="float: right; margin-top: 2px"
          >{{ account.substr(0, 5) }}...{{ account.substr(-5) }}</a
        >
      </div>
      <router-view />
    </div>
    <div
      v-if="account && !checking && instance.length === 0"
      style="padding: 35vh 0; text-align: center"
    >
      <h1 class="title is-2">Deploy your instance</h1>
      <h2 class="title is-3">
        In order to create contents you must create an NFT contract where your
        contents will be stored.<br />Deploy is completely free, you just need
        to pay for gas fees.
      </h2>
      <b-button v-if="!checking" @click="deploy">DEPLOY CONTRACT</b-button>
      <br /><br />
      <div v-if="isWorking">{{ workingMessage }}</div>
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
.button,
.input {
  font-family: "JetBrains Mono", monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  font-size: 13px;
}
.button {
  border-color: #000 !important;
  border-radius: 0 !important;
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
const abi = require("./abis/factory.json");
export default {
  name: "Home",
  data() {
    return {
      infuraId: process.env.VUE_APP_INFURA_ID,
      umiUrl: process.env.VUE_APP_UMI_API,
      network: parseInt(process.env.VUE_APP_CHAIN_ID),
      axios: axios,
      abi: abi,
      contract: process.env.VUE_APP_FACTORY_CONTRACT,
      account: "",
      instance: "",
      checking: false,
      isWorking: false,
      workingMessage: "",
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
            const factoryContract = new web3.eth.Contract(app.abi, app.contract);
            const instanceAddress = await factoryContract.methods
              .instances(accounts[0])
              .call();
            console.log("Instance exists?", instanceAddress);
            app.account = accounts[0];
            if (
              instanceAddress !== "0x0000000000000000000000000000000000000000"
            ) {
              app.checking = false;
              app.instance = instanceAddress;
            } else {
              app.checking = false;
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
    async deploy() {
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
          app.isWorking = true;
          const nftContract = new web3.eth.Contract(app.abi, app.contract);
          const newInstance = await nftContract.methods
            .startNewContents("MEGO", "MEGO")
            .send({ from: app.account })
            .on("transactionHash", (tx) => {
              app.workingMessage = "Found pending transaction at: " + tx;
            });
          console.log("FACTORY_RECEIPT", newInstance);
          const instanceAddress = await nftContract.methods
            .instances(app.account)
            .call();
          console.log("Instance exists?", instanceAddress);
          app.isWorking = false;
          app.instance = instanceAddress;
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
