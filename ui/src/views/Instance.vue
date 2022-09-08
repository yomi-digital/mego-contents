<template>
  <div id="instance">
    <div class="modal_container" v-if="modals.removeDatatype">
      <div class="modal">
        <img src="../assets/images/close-icon.svg" alt="Close" @click="modals.removeDatatype = false">
        <h2 v-html="workingMessage"></h2>
        <!-- <p>Define the name and the ticker of the instance.</p> -->
        <font-awesome-icon icon="fa-solid fa-circle-notch" style="font-size:20px;margin-top: .2rem;" class="fa-spin"
          v-if="isWorking" />
      </div>
    </div>
    <div class="modal_container" v-if="modals.addDatatype">
      <div class="modal">
        <img src="../assets/images/close-icon.svg" alt="Close" @click="modals.addDatatype = false">
        <h2 v-html="workingMessage"></h2>
        <!-- <p>Define the name and the ticker of the instance.</p> -->
        <font-awesome-icon icon="fa-solid fa-circle-notch" style="font-size:20px;margin-top: .2rem;" class="fa-spin"
          v-if="isWorking" />
      </div>
    </div>
    <div class="modal_container" v-if="modals.removeDatatypeAttr >= 0">
      <div class="modal">
        <img src="../assets/images/close-icon.svg" alt="Close" @click="modals.removeDatatypeAttr = -1">
        <h2>Are you sure you want to delete the selected datatype field?</h2>
        <!-- <p>Define the name and the ticker of the instance.</p> -->
        <div style="display:flex">
          <b-button type="button" class="button-light is-dark mx-3 mt-5"
            style="color:black!important;border:1px solid black!important" @click="modals.removeDatatypeAttr = -1">
            NO
          </b-button>
          <b-button type="button" class="button-dark is-light mx-3 mt-5"
            style="background:#111!important;color:white!important" @click="resetCustomDatatypesAttrs">
            YES
          </b-button>
        </div>
      </div>
    </div>
    <div class="instances_container">
      <div class="instance_info">
        <h2>MANAGE YOUR INSTANCE</h2>
        <p v-if="!loading">
          Deployed at: {{instance}}</p>
        <p v-if="loading">
          Deployed at: 0x
          <font-awesome-icon icon="fa-solid fa-circle-notch" style="font-size:25px" class="fa-spin ml-3" />
        </p>
      </div>
      <div class="instances_header">
        <h2 class="has-text-weight-semibold">{{(datatypeCreated) ? newDatatypeName : 'AVAILABLE DATATYPES'}}
          <!-- <b-button type="button"
            class="button-dark is-light mr-0 ml-4" style="background:#111!important;color:white!important">
            <font-awesome-icon icon="fa-solid fa-plus" style="font-size:24px" />
          </b-button> -->
        </h2>
        <div style="display:flex;margin-right:0;margin-left:auto">
          <p class="tab" :style="(tab === 'pre-compiled') ? 'color: black; font-weight: 800;' : ''"
            @click="tab = 'pre-compiled'" v-if="tab !== 'list'">
            pre-compiled</p>
          <p class="tab" :style="(tab === 'customized') ? 'color: black; font-weight: 800;' : ''"
            @click="tab = 'customized'" v-if="tab !== 'list'">
            customized</p>
          <b-button type="button button-dark is-light ml-auto mr-0 mt-1"
            style="background:#111!important;color:white!important" class="button" v-if="tab === 'list'"
            @click="tab = 'pre-compiled'">
            CREATE NEW DATATYPE
          </b-button>
          <b-button type="button button-dark is-light ml-auto mr-0 mt-1"
            style="background:#111!important;color:white!important" class="button" v-if="tab !== 'list'"
            @click="tab = 'list'">
            VIEW ALL DATATYPES
          </b-button>
        </div>

      </div>
      <div class="instances_loading" v-if="loading">
        <font-awesome-icon icon="fa-solid fa-circle-notch" style="font-size:25px" class="fa-spin" />
      </div>
      <div class="no_instances" v-if="!loading && Object.keys(datatypes[instance]).length === 0 && tab == 'list'">
        You have no datatypes in this instance
      </div>
      <div class="instances_list" v-if="!loading && tab === 'list'">
        <div class="instance" v-for="datatype in Object.keys(datatypes[instance])" :key="datatype">
          <div class="instance_left">
            <h3 class="my-2"><span style="font-weight:bold;color:black;font-size:22px;">{{datatype.slice(datatype.indexOf('__')+2, 99999)}}</span></h3>
            <p v-for="attr in datatypes[instance][datatype].fields" :key="attr.name" v-html="attr.name"></p>
            <p v-if="datatypes[instance][datatype].fields.length === 0"><i style="color:#444">No fields</i></p>
          </div>
          <div class="instance_right">
            <b-button type="button" class="button button-dark is-light mx-auto mt-0"
              @click="() => {modals.removeDatatype = true;removeDatatype(datatype)}">Remove
              datatype</b-button>
            <b-button type="button" class="button button-dark is-light mx-auto mt-0"
              @click="() => {newDatatypeName = datatype.slice(datatype.indexOf('__')+2, 99999); datatypeCreated = true; tab = 'customized'}">Edit
              datatype</b-button>
          </div>
        </div>
      </div>
      <div class="add_instance_container" v-if="!loading && (tab === 'pre-compiled' || tab === 'customized')">
        <div class="add_instance_list instances_list" v-if="tab === 'pre-compiled'">
          <div class="instance" v-for="datatype in preCompiledDatatypes" :key="datatype.name">
            <div class="instance_left">
              <h3 class="my-2"><span style="font-weight:bold;color:black;font-size:22px;">{{datatype.name}}</span></h3>
              <p v-for="attr in datatype.attrs" :key="attr.name" v-html="attr.name"></p>
              <p v-if="datatype.attrs.length === 0"><i style="color:#444">No fields</i></p>
            </div>
            <div class="instance_right">
              <b-button type="button" class="button button-dark is-light mx-auto mt-0"
                @click="() => {addDatatype(datatype.name);modals.addDatatype = true;}">Add datatype to contract
              </b-button>
            </div>
          </div>
        </div>
        <div class="add_instance_form" v-if="tab === 'customized'">
          <b-input type="text" v-model="newDatatypeName" class="my-5" placeholder="DATATYPE_NAME" v-if="!datatypeCreated"></b-input>
          <table class="mx-auto" v-if="datatypeCreated">
            <tr>
              <th style="text-align:center">Active</th>
              <th>Name</th>
              <th style="text-align:center">Print</th>
              <th style="text-align:center">Required</th>
              <th style="text-align:center">Multiple</th>
              <th>Type</th>
              <th>Specs</th>
              <th style="text-align:center">Delete</th>
            </tr>
            <tr v-for="(datatypeAttr, index) in customDatatypeAttrs" :key="index">
              <td>
                <b-input type="checkbox" @change="datatypeAttr.active = !datatypeAttr.active" :checked="datatypeAttr.active">
                </b-input>
              </td>
              <td>
                <b-input type="text" style="width:200px" placeholder="FIELD NAME" v-model="datatypeAttr.name"></b-input>
              </td>
              <td>
                <b-input type="checkbox" @change="datatypeAttr.print = !datatypeAttr.print" :checked="datatypeAttr.print"></b-input>
              </td>
              <td>
                <b-input type="checkbox" @change="datatypeAttr.required = !datatypeAttr.required" :checked="datatypeAttr.required">
                </b-input>
              </td>
              <td>
                <b-input type="checkbox" @change="datatypeAttr.multiple = !datatypeAttr.multiple" :checked="datatypeAttr.multiple">
                </b-input>
              </td>
              <td>
                <b-select v-model="datatypeAttr.type" style="width:120px">
                  <option v-for="option in datatypeTypes" :value="option" :key="option">
                    {{ option }}
                  </option>
                </b-select>
              </td>
              <td>
                <b-input type="text" style="width:300px" v-model="datatypeAttr.specs"></b-input>
              </td>
              <td style="text-align:center">
                <img src="../assets/images/trash-icon.svg" alt="" style="cursor:pointer" @click="modals.removeDatatypeAttr = index">
              </td>
            </tr>
            <tr>
              <td colspan="7"></td>
              <td style="display:flex;justify-content:center">
                <b-button type="button" class="button-dark is-light mr-0 ml-4"
                  style="background:#111!important;color:white!important;height: 3rem;text-align: center;margin: auto!important;"
                  @click="customDatatypeAttrs.push({
            active: false,
            name: '',
            print: false,
            required: false,
            multiple: false,
            type: 'text',
            specs: ''
          })">
                  <font-awesome-icon icon="fa-solid fa-plus" style="font-size:20px" />
                </b-button>
              </td>
            </tr>
          </table>
        </div>
        <div class="pb-6 mx-auto" style="display:flex" v-if="tab === 'customized'">
          <b-button type="button" class="button-light is-dark mx-auto mt-5 px-5"
            style="color:black!important;border:1px solid black!important" v-if="!datatypeCreated" @click="() => {modals.addDatatype = true;addDatatype(newDatatypeName)}">
            CREATE NEW DATATYPE
          </b-button>
          <b-button type="button" class="button-light is-dark mx-auto mt-5 px-5"
            style="color:black!important;border:1px solid black!important" v-if="datatypeCreated" @click="() => {modals.addDatatype = true;populateDatatype(newDatatypeName)}">
            ADD TO CONTRACT
          </b-button>
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
    name: 'Instance',
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
        instance: this.$route.params.instance,
        instances: [],
        datatypes: {},
        names: [],
        loading: true,
        tab: 'list',
        newDatatypeName: '',
        preCompiledDatatypes: [{
          name: 'blog',
          attrs: [{
              name: 'name'
            },
            {
              name: 'description'
            },
            {
              name: 'body'
            },
            {
              name: 'type'
            },
            {
              name: 'tag'
            },
            {
              name: 'image'
            }
          ]
        }, {
          name: 'nft',
          attrs: [{
              name: 'name'
            },
            {
              name: 'description'
            },
            {
              name: 'image'
            }
          ]
        }],
        datatypeTypes: ['text', 'textarea', 'file', 'checkbox'],
        customDatatypeAttrs: [{
            active: false,
            name: '',
            print: false,
            required: false,
            multiple: false,
            type: 'text',
            specs: ''
          },
          {
            active: false,
            name: '',
            print: false,
            required: false,
            multiple: false,
            type: 'text',
            specs: ''
          },
          {
            active: false,
            name: '',
            print: false,
            required: false,
            multiple: false,
            type: 'text',
            specs: ''
          }
        ],
        isWorking: false,
        workingMessage: '',
        modals: {
          removeDatatype: false,
          addDatatype: false,
          removeDatatypeAttr: -1
        },
        datatypeCreated: false
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
              await app.fetchModels(app.instance);
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
      async populateDatatype(datatype) {
        if(datatype.indexOf('0x') !== -1) {
          datatype = datatype.slice(datatype.indexOf('__')+2, 99999)
        }
        const app = this;
        const factoryContract = new app.web3.eth.Contract(
          app.abi_factory,
          app.instance
        );
        app.isWorking = true;
        try {
          console.log("Populating type:", datatype);
          app.workingMessage = "Updating "+datatype+" <br />Please confirm transaction in your wallet.";
          for(let index of Object.keys(app.customDatatypeAttrs)) {
            let field = app.customDatatypeAttrs[index]
            field.specs = 'plain'
            console.log(app.account.substr(0,5)+app.account.substr(-3)+'__'+datatype, index, field.active, field.name, field.print, field.required, field.multiple, field.type, field.specs)
            const receipt = await factoryContract.methods
              .editDatatypeInModel(app.account.substr(0,5)+app.account.substr(-3)+'__'+datatype, index, field.active, field.name, field.print, field.required, field.multiple, field.type, field.specs)
              .send({
                from: app.account,
              })
              .on("transactionHash", (tx) => {
                app.workingMessage =
                  "Updating"+datatype+" <br />Waiting for confirmations at " + tx;
              });
            console.log("ADD_TYPE_RECEIPT", receipt);
          }
          app.fetchModels(app.instance);
          app.isWorking = false;
          window.location.reload();
        } catch (e) {
          alert(e.message);
          app.isWorking = false;
        }
      },
      async addDatatype(datatype) {
        const app = this;
        const contentsContract = new app.web3.eth.Contract(
          app.abi_contents,
          app.instance
        );
        app.isWorking = true;
        try {
          console.log("Adding type:", datatype);
          app.workingMessage = "Adding new datatype <br />Please confirm transaction in your wallet.";
          const receipt = await contentsContract.methods
            .addType(app.account.substr(0,5)+app.account.substr(-3)+'__'+datatype)
            .send({
              from: app.account
            })
            .on("transactionHash", (tx) => {
              app.workingMessage =
                "Adding new datatype <br />Waiting for confirmations at " + tx;
            });
          console.log("ADD_TYPE_RECEIPT", receipt);
          app.fetchModels(app.instance);
          app.isWorking = false;
          //If it's a pre-compiled datatype
          if(this.preCompiledDatatypes.find(el => el.name === datatype) != undefined) {
            window.location.reload();
          }
          else {
            app.datatypeCreated = true
            app.modals.addDatatype = false;
          }
        } catch (e) {
          alert(e.message);
          app.isWorking = false;
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
                app.datatypes[instance][result] = {};
                let datatypes = [];
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
                      specs: datatype._specs
                    });
                  }
                  t++;
                  if (datatype._name.length === 0) {
                    finished = true;
                  }
                }
                app.datatypes[instance][result] = {fields: datatypes, modelIndex: i};
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
      async removeDatatype(datatype) {
        const app = this;
        const contentsContract = new app.web3.eth.Contract(
          app.abi_contents,
          app.instance
        );
        app.isWorking = true;
        try {
          app.workingMessage = "Removing the datatype <br />Please confirm transaction in your wallet.";
          const receipt = await contentsContract.methods
            .removeType(datatype, app.datatypes[app.instance][datatype].modelIndex)
            .send({
              from: app.account,
            })
            .on("transactionHash", (tx) => {
              app.workingMessage =
                "Removing the datatype <br />Waiting for confirmations at " + tx;
            });
          console.log("ADD_TYPE_RECEIPT", receipt);
          app.fetchModels(app.instance);
          app.isWorking = false;
          window.location.reload();
        } catch (e) {
          alert(e.message);
          app.isWorking = false;
        }
      },
      resetCustomDatatypesAttrs() {
        let newArr = []
        this.customDatatypeAttrs.forEach((attr, index) => {
          if(index !== this.modals.removeDatatypeAttr) {
            newArr.push(attr)
          }
        })
        this.customDatatypeAttrs = newArr
        this.modals.removeDatatypeAttr = -1
      }
    },
    async mounted() {
      document.getElementById('app').style.background = '#EDEDED'
      await this.connect()
      this.loading = false
    }
  }
</script>