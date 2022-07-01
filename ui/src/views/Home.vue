<template>
  <div class="home">
    <div v-if="!loading">
      <h1 class="title is-3">Manage your instance</h1>
      <h3 class="title is-5">
        Deployed at: <span style="font-weight: normal">{{ instance }}</span>
      </h3>
      <div v-if="Object.keys(datatypes).length > 0">
        {{ datatypes }}
      </div>
      <div v-if="Object.keys(datatypes).length === 0 && !isWorking">
        You don't have any datatype in contract, please add or create a new
        one.<br />
        <hr />
        <h3 class="title is-5">Available types:</h3>
        <div v-for="(datatype, index) in available" v-bind:key="index">
          <b>{{ index }}</b
          ><br />
          {{ datatype }}
          <br /><br />
          <b-button @click="addType(index)">ADD DATAYPE TO CONTRACT</b-button>
        </div>
      </div>
    </div>
    <div v-if="loading">Syncing state with blockchain, please wait..</div>
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
  name: "Home",
  data() {
    return {
      infuraId: process.env.VUE_APP_INFURA_ID,
      umiUrl: process.env.VUE_APP_UMI_API,
      axios: axios,
      abi_factory: abi_factory,
      abi_contents: abi_contents,
      contract: process.env.VUE_APP_FACTORY_CONTRACT,
      network: parseInt(process.env.VUE_APP_CHAIN_ID),
      web3: {},
      account: "",
      isWorking: false,
      loading: true,
      workingMessage: "",
      instance: "",
      datatypes: {},
      available: {},
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
            const factoryContract = new web3.eth.Contract(
              app.abi_factory,
              app.contract
            );
            app.instance = await factoryContract.methods
              .instances(accounts[0])
              .call();
            app.fetchModels();
            app.fetchDatatypes();
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
            let datatypes = [];
            console.log("Model found:", result);
            let finished = false;
            let t = 0;
            while (!finished) {
              const datatype = await factoryContract.methods
                .returnModelType(result, t)
                .call();
              if (datatype._active) {
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
    async fetchDatatypes() {
      const app = this;
      const factoryContract = new app.web3.eth.Contract(
        app.abi_factory,
        app.contract
      );
      let exists = true;
      let i = 0;
      while (exists) {
        try {
          const result = await factoryContract.methods.created(i).call();
          if (result.length > 0) {
            app.available[result] = [];
            let datatypes = [];
            console.log("Datatype found:", result);
            let finished = false;
            let t = 0;
            while (!finished) {
              const datatype = await factoryContract.methods
                .returnModelType(result, t)
                .call();
              if (datatype._active) {
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
            app.available[result] = datatypes;
          }
          i++;
        } catch (e) {
          console.log("Datatype parse finished.");
          exists = false;
        }
      }
      app.loading = false;
    },
    async addType(type) {
      const app = this;
      const contentsContract = new app.web3.eth.Contract(
        app.abi_contents,
        app.instance
      );
      app.isWorking = true;
      try {
        console.log("Adding type:", type);
        app.workingMessage = "Please confirm transaction in your wallet.";
        const receipt = await contentsContract.methods
          .addType(type)
          .send({ from: app.account })
          .on("transactionHash", (tx) => {
            app.workingMessage =
              "Adding type, waiting for confirmations at " + tx;
          });
        console.log("ADD_TYPE_RECEIPT", receipt);
        app.fetchModels();
        app.fetchDatatypes();
        app.isWorking = false;
      } catch (e) {
        alert(e.message);
        app.isWorking = false;
      }
    },
  },
};
</script>
