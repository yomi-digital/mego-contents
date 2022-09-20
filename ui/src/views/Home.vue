<template>
  <div class="home">
    <div v-if="!loading">
      <h1 class="title is-3">
        Manage your instances
        <b-button
          style="float: right; font-size: 12px"
          @click="showCreateInstanceModal = true"
          >CREATE NEW INSTANCE</b-button
        >
      </h1>
      <section>
        <b-tabs v-model="activeTab">
          <b-tab-item
            :label="names[instance]"
            v-for="instance in instances"
            :key="instance"
            :animated="false"
          >
            <span
              ><b>Deployed at</b>:
              <a
                :href="explorer_url + '/address/' + instance"
                target="_blank"
                style="font-weight: normal"
                >{{ instance }}</a
              ></span
            ><br />
            <b>Headless endpoint</b>:
            <a
              target="_blank"
              :href="contents_api + '/contents/' + instance"
              >{{contents_api + '/contents/' + instance }}</a
            >
            <b-button
              style="float: right"
              v-if="selected !== instance"
              @click="selectInstance(instance)"
              >USE THIS INSTANCE</b-button
            >
            <div
              v-if="
                datatypes[instance] !== undefined &&
                Object.keys(datatypes[instance]).length > 0
              "
            >
              <h3 class="title is-5 my-4">Types:</h3>
              <b-table
                :data="
                  Object.keys(datatypes[instance]).map((el) => {
                    return {
                      index: datatypes[instance][el].index,
                      datatype_name: el,
                      fields: datatypes[instance][el].length,
                    };
                  })
                "
                ref="table"
                :opened-detailed="defaultDatatypeOpened"
                detailed
                detail-key="datatype_name"
                detail-transition=""
                :show-detail-icon="true"
                aria-next-label="Next page"
                aria-previous-label="Previous page"
                aria-page-label="Page"
                aria-current-label="Current page"
              >
                <b-table-column
                  field="datatype_name"
                  label="Datatype Name"
                  sortable
                  width="300"
                  v-slot="props"
                >
                  {{ props.row.datatype_name }}
                </b-table-column>

                <b-table-column
                  field="fields"
                  label="N. Fields"
                  sortable
                  width="90"
                  v-slot="props"
                >
                  {{ props.row.fields }}
                </b-table-column>

                <b-table-column
                  field="fields"
                  label="Remove type"
                  sortable
                  width="90"
                  v-slot="props"
                >
                  <b-button
                    style="font-size: 12px"
                    @click="removeType(instance, props.row.datatype_name)"
                    >REMOVE TYPE FROM CONTRACT</b-button
                  >
                </b-table-column>

                <template #detail="props">
                  <article class="media" style="display: block">
                    <b-table
                      :data="datatypes[instance][props.row.datatype_name]"
                      :columns="[
                        { field: 'name', label: 'Name', width: '280' },
                        { field: 'print', label: 'Print', width: '40' },
                        { field: 'required', label: 'Required', width: '40' },
                        { field: 'multiple', label: 'Multiple', width: '40' },
                        { field: 'input', label: 'Input', width: '40' },
                        { field: 'specs', lable: 'Specs', width: '60' },
                      ]"
                    ></b-table>
                  </article>
                </template>
              </b-table>
            </div>
            <div
              style="margin-top: 30px"
              v-if="
                Object.keys(datatypes[instance]).length <
                Object.keys(available).length
              "
            >
              <hr />
              <h3 class="title is-5">Add types to instance</h3>
              <div v-if="Object.keys(datatypes[instance]).length === 0">
                In order to create NFTs you need to choose one or more types.
                Each type defines the way how the form is structured and the
                data will be stored in IPFS.<br />You can choose between our
                predefined models, if you want some other model please
                <a href="https://discord.gg/3BmJnbD28c" target="_blank"
                  >ask us via Discord</a
                >. <br /><br />
              </div>
              <div v-for="(datatype, index) in available" v-bind:key="index">
                <div
                  v-if="datatypes[instance][index] === undefined"
                  style="position: relative; margin-bottom: 20px"
                >
                  <b style="font-size: 16px">TYPE: {{ index.toUpperCase() }}</b
                  ><br />
                  Contains following fields:
                  <span
                    v-for="(type, index) in datatype"
                    v-bind:key="type.name"
                  >
                    <span v-if="index > 0">, </span>{{ type.name }}</span
                  >. <br /><br />
                  <b-button
                    style="
                      float: right;
                      position: absolute;
                      top: 0;
                      right: 0;
                      font-size: 12px;
                    "
                    @click="addType(instance, index)"
                    >ADD TYPE TO CONTRACT</b-button
                  >
                </div>
              </div>
            </div>
          </b-tab-item>
        </b-tabs>
      </section>
      <b-modal
        v-model="showCreateInstanceModal"
        has-modal-card
        trap-focus
        :destroy-on-hide="true"
        aria-role="dialog"
        aria-label="Create new instance"
        close-button-aria-label="Close"
        aria-modal
      >
        <template>
          <div class="modal-card" style="width: auto">
            <header class="modal-card-head">
              <p class="modal-card-title">Create new instance</p>
              <button
                type="button"
                class="delete"
                @click="showCreateInstanceModal = false"
              />
            </header>
            <section class="modal-card-body">
              Define the name and the ticker of the instance.<br /><br />
              <b-input
                v-model="newInstanceName"
                placeholder="New instance name"
              /><br />
              <b-input
                v-model="newInstanceTicker"
                placeholder="New instance ticker"
              /><br />
              <b-button expanded v-if="!isWorking" @click="deploy"
                >DEPLOY CONTRACT</b-button
              >
            </section>
          </div>
        </template>
      </b-modal>
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
      explorer_url: process.env.VUE_APP_EXPLORER_URL,
      contents_api: process.env.VUE_APP_CONTENTS_API,
      contract: process.env.VUE_APP_FACTORY_CONTRACT,
      network: parseInt(process.env.VUE_APP_CHAIN_ID),
      web3: {},
      selected: "",
      account: "",
      showCreateInstanceModal: false,
      isWorking: false,
      checking: false,
      loading: true,
      workingMessage: "",
      newInstanceName: "",
      newInstanceTicker: "",
      instances: [],
      datatypes: {},
      available: {},
      names: {},
      activeTab: 0,
      datatype_selected: null,
      defaultDatatypeOpened: [],
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
              console.log(
                "Selected instance:",
                localStorage.getItem("instance")
              );
              if (
                localStorage.getItem("instance") === null ||
                localStorage.getItem("instance") === undefined
              ) {
                localStorage.setItem("instance", app.instances[0]);
              } else if (
                app.instances.indexOf(localStorage.getItem("instance")) === -1
              ) {
                localStorage.setItem("instance", app.instances[0]);
              }
              app.selected = localStorage.getItem("instance");
              for (let k in app.instances) {
                const contentsContract = new app.web3.eth.Contract(
                  app.abi_contents,
                  app.instances[k]
                );
                const name = await contentsContract.methods.name().call();
                console.log("Instance name:", name);
                app.names[app.instances[k]] = name;
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
          app.$forceUpdate();
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
          .send({
            from: app.account,
          })
          .on("transactionHash", (tx) => {
            app.workingMessage =
              "Adding type, waiting for confirmations at " + tx;
          });
        console.log("ADD_TYPE_RECEIPT", receipt);
        app.fetchModels(instance);
        app.isWorking = false;
        window.location.reload();
      } catch (e) {
        alert(e.message);
        app.isWorking = false;
      }
    },
    async removeType(instance, type) {
      const app = this;
      const contentsContract = new app.web3.eth.Contract(
        app.abi_contents,
        instance
      );
      app.isWorking = true;
      let i = 0;
      let c = 0;
      for (let k in app.datatypes[instance]) {
        if (k === type) {
          i = c;
        }
        c++;
      }
      try {
        console.log("Removing type:", type);
        app.workingMessage = "Please confirm transaction in your wallet.";
        const receipt = await contentsContract.methods
          .removeType(type, i)
          .send({
            from: app.account,
          })
          .on("transactionHash", (tx) => {
            app.workingMessage =
              "Adding type, waiting for confirmations at " + tx;
          });
        console.log("ADD_TYPE_RECEIPT", receipt);
        app.fetchModels(instance);
        app.isWorking = false;
        window.location.reload();
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
          app.isWorking = false;
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
    },
    selectInstance(instance) {
      localStorage.setItem("instance", instance);
      window.location.reload();
    },
  },
};
</script>
