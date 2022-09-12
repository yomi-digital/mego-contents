<template>
  <div id="instances">
    <div class="modal_container" v-if="modals.createInstance">
      <div class="modal">
        <img src="../assets/images/close-icon.svg" alt="Close" @click="modals.createInstance = false">
        <h2>Create new instance</h2>
        <p>Define the name and the ticker of the instance.</p>
        <b-input type="text" class="mt-5" placeholder="New instance name" v-model="newInstanceName"></b-input>
        <b-input type="text" class="mt-4" placeholder="New instance ticker" v-model="newInstanceTicker"></b-input>
        <b-button type="button button-dark is-light mt-5" style="background:#111!important;color:white!important"
          class="button" @click="deployContract" v-if="!isWorking">
          DEPLOY CONTRACT
        </b-button>
        <b-button type="button button-dark is-light mt-5" style="background:#111!important;color:white!important"
          class="button" @click="deployContract" v-if="isWorking">
          <font-awesome-icon icon="fa-solid fa-circle-notch" style="font-size:20px;margin-top: .2rem;"
            class="fa-spin" />
        </b-button>
      </div>
    </div>
    <div class="instances_container">
      <div class="instance_info">
        <h2>DEPLOY YOUR INSTANCE</h2>
      </div>
      <div class="instances_header">
        <h2 class="has-text-weight-semibold">AVAILABLE INSTANCES
          <!-- <b-button type="button" class="button-dark is-light mr-0 ml-4"
            style="background:#111!important;color:white!important">
            <font-awesome-icon icon="fa-solid fa-plus" style="font-size:24px" />
          </b-button> -->
        </h2>
        <b-button type="button button-dark is-light ml-auto mr-0 mt-1"
          style="background:#111!important;color:white!important" class="button" @click="modals.createInstance = true">
          CREATE NEW INSTANCE
        </b-button>
      </div>
      <div class="instances_loading" v-if="loading">
        <font-awesome-icon icon="fa-solid fa-circle-notch" style="font-size:25px" class="fa-spin" />
      </div>
      <div class="no_instances" v-if="instances.length === 0 && !loading">
        You have no instance at the moment
      </div>
      <div class="instances_list" v-if="!loading">
        <div class="instance" v-for="instance in Object.keys(datatypes)" :key="instance">
          <div class="instance_left">
            <h3 class="my-2"><span style="font-weight:bold;color:black;font-size:22px;">{{names[instance]}}</span><i
                style="font-size:15px; margin:0 1rem">Deployed at: <a :href="'https://etherscan.io/address/'+instance"
                  target="_blank"
                  style="color:black;text-decoration:underline">{{Object.entries(names).find(el => el[0] === instance)[0]}}</a></i>
            </h3>
            <p v-for="datatype in Object.keys(datatypes[instance])" :key="datatype" v-html="(datatype.indexOf('__') > 0) ? datatype.slice(datatype.indexOf('__')+2, 99999) : datatype"></p>
            <p v-if="Object.keys(datatypes[instance]).length === 0"><i style="color:#444">No datatypes</i></p>
          </div>
          <div class="instance_right">
            <b-button type="button" class="button button-dark is-light mx-auto mt-0"
              @click="$router.push({name: 'Instance', params: {instance: instance}})">MANAGE INSTANCE</b-button>
          </div>
        </div>
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
    name: 'Instances',
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
        content: {},
        instances: [],
        datatypes: {},
        names: [],
        loading: true,
        modals: {
          createInstance: false
        },
        newInstanceName: '',
        newInstanceTicker: '',
        isWorking: false
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
              const factoryContract = new web3.eth.Contract(
                app.abi_factory,
                app.contract
              );
              app.instances = await factoryContract.methods
                .instancesOfOwner(app.account)
                .call();
              for (let k in app.instances) {
                const contentsContract = new app.web3.eth.Contract(
                  app.abi_contents,
                  app.instances[k]
                );
                const name = await contentsContract.methods.name().call();
                app.names[app.instances[k]] = name;
                await app.fetchModels(app.instances[k]);
              }
              app.loading = false
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
                // let finished = false;
                // let t = 0;
                // while (!finished) {
                //   const datatype = await factoryContract.methods
                //     .returnModelType(result, t)
                //     .call();
                //   if (datatype._active) {
                //     datatypes.push({
                //       name: datatype._name,
                //       print: datatype._print,
                //       required: datatype._required,
                //       multiple: datatype._multiple,
                //       input: datatype._input,
                //       specs: datatype._specs,
                //     });
                //   }
                //   t++;
                //   if (datatype._name.length === 0) {
                //     finished = true;
                //   }
                // }
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
      async deployContract() {
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
            const deployment_price = await nftContract.methods
              .deployment_price()
              .call();
            const newInstance = await nftContract.methods
              .startNewInstance(app.newInstanceName, app.newInstanceTicker)
              .send({
                from: app.account,
                value: deployment_price,
              })
              .on("transactionHash", (tx) => {
                app.workingMessage = "Found pending transaction at: " + tx;
              });
            console.log("FACTORY_RECEIPT", newInstance);
            const instanceAddress = await nftContract.methods
              .instances(app.account)
              .call();
            console.log("Instance exists?", instanceAddress);
            app.instance = instanceAddress;
            app.newInstanceName = "";
            app.newInstanceTicker = "";
            window.location.reload();
          } else {
            alert(
              "Wrong network, please connect to correct one (" +
              app.network +
              ")!"
            );
          }
        } catch (e) {
          app.isWorking = false;
          alert(e.message);
        }
      }
    },
    async mounted() {
      document.getElementById('app').style.background = '#EDEDED'
      document.getElementById('navbar_group').children[1].style.background = '#EDEDED'
      const app = this;
      await app.connect();
    }
  }
</script>