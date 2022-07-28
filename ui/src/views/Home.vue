<template>
  <div class="home">
    <div v-if="!loading">
      <h1 class="title is-3">Manage your instances</h1>
      <div v-for="instance in instances" v-bind:key="instance">
        <h3 class="title is-5">
          Deployed at: <span style="font-weight: normal">{{ instance }}</span>
          <b-button
            style="float: right"
            v-if="selected !== instance"
            @click="selectInstance(instance)"
            >USE THIS INSTANCE</b-button
          >
        </h3>
        <div
          v-if="
            datatypes[instance] !== undefined &&
            Object.keys(datatypes[instance]).length > 0
          "
        >
          {{ datatypes[instance] }}
        </div>
        <div
          v-if="
            ((datatypes[instance] !== undefined &&
              Object.keys(datatypes[instance]).length === 0) ||
              datatypes[instance] === undefined) &&
            !isWorking
          "
        >
          You don't have any datatype in contract, please add or create a new
          one.<br />
          <hr />
          <h3 class="title is-5">Add types to instance:</h3>
          <div v-for="(datatype, index) in available" v-bind:key="index">
            <b>{{ index }}</b
            ><br />
            {{ datatype }}
            <br /><br />
            <b-button @click="addType(instance, index)"
              >ADD DATAYPE TO CONTRACT</b-button
            >
          </div>
        </div>
        <hr />
      </div>
      Deploy a new instance<br /><br />
      <b-button v-if="!isWorking" @click="deploy">DEPLOY CONTRACT</b-button>
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
      selected: "",
      account: "",
      isWorking: false,
      checking: false,
      loading: true,
      workingMessage: "",
      instances: [],
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
            app.fetchDatatypes();
            app.instances = await factoryContract.methods
              .instancesOfOwner(app.account)
              .call();
            console.log("Deployed instances:", app.instances);
            if (app.instances.length > 0) {
              if (localStorage.getItem("instance") === null) {
                localStorage.setItem("instance", app.instances[0]);
              }
              app.selected = localStorage.getItem("instance");
              for (let k in app.instances) {
                await app.fetchModels(app.instances[k]);
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
    log(type, content) {
      this.$buefy.snackbar.open({
        type: "is-" + type,
        message: content,
        pauseOnHover: true,
      });
    },
    fetchModels(instance) {
      return new Promise(async (response) => {
        const app = this;
        setTimeout(function () {
          app.$forceUpdate();
        }, 500);
        const contentsContract = new app.web3.eth.Contract(
          app.abi_contents,
          instance
        );
        const factoryContract = new app.web3.eth.Contract(
          app.abi_factory,
          app.contract
        );
        let exists = true;
        let i = 0;
        app.datatypes[instance] = {};
        while (exists) {
          try {
            const result = await contentsContract.methods
              .content_models(i)
              .call();
            if (result.length > 0) {
              app.datatypes[instance][result] = [];
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
              app.datatypes[instance][result] = datatypes;
            }
            i++;
          } catch (e) {
            console.log("Model parse finished.");
            exists = false;
          }
        }
        response(true);
      });
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
          console.log("Created datatypes:", result);
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
    async addType(instance, type) {
      const app = this;
      const contentsContract = new app.web3.eth.Contract(
        app.abi_contents,
        instance
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
        app.fetchModels(instance);
        app.isWorking = false;
      } catch (e) {
        alert(e.message);
        app.isWorking = false;
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
          const nftContract = new web3.eth.Contract(
            app.abi_factory,
            app.contract
          );
          const newInstance = await nftContract.methods
            .startNewInstance("MEGO CONTENTS", "MEGO")
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
    selectInstance(instance) {
      localStorage.setItem("instance", instance);
      window.location.reload();
    },
  },
};
</script>
