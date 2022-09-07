<template>
  <div id="instance">
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
        <h2 class="has-text-weight-semibold">AVAILABLE DATATYPES
          <!-- <b-button type="button"
            class="button-dark is-light mr-0 ml-4" style="background:#111!important;color:white!important">
            <font-awesome-icon icon="fa-solid fa-plus" style="font-size:24px" />
          </b-button> -->
        </h2>
        <div style="display:flex;margin-right:0;margin-left:auto">
          <p class="tab" :style="(tab === 'pre-compiled') ? 'color: black; font-weight: 800;' : ''" @click="tab = 'pre-compiled'" v-if="tab !== 'list'">
            pre-compiled</p>
          <p class="tab" :style="(tab === 'customized') ? 'color: black; font-weight: 800;' : ''" @click="tab = 'customized'" v-if="tab !== 'list'">
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
            <h3 class="my-2"><span style="font-weight:bold;color:black;font-size:22px;">{{datatype}}</span></h3>
            <p v-for="attr in datatypes[instance][datatype]" :key="attr.name" v-html="attr.name"></p>
            <p v-if="datatypes[instance][datatype].length === 0"><i style="color:#444">No attributes</i></p>
          </div>
          <div class="instance_right">
            <b-button type="button" class="button button-dark is-light mx-auto mt-0"
              @click="$router.push({name: 'Instance', params: {instance: instance}})">Remove datatype</b-button>
          </div>
        </div>
      </div>
      <div class="add_instance_container" v-if="tab === 'pre-compiled' || tab === 'customized'">
        <div class="add_instance_list instances_list" v-if="tab === 'pre-compiled'">
          <div class="instance" v-for="datatype in preCompiledDatatypes" :key="datatype.name">
            <div class="instance_left">
              <h3 class="my-2"><span style="font-weight:bold;color:black;font-size:22px;">{{datatype.name}}</span></h3>
              <p v-for="attr in datatype.attrs" :key="attr.name" v-html="attr.name"></p>
              <p v-if="datatype.attrs.length === 0"><i style="color:#444">No attributes</i></p>
            </div>
            <div class="instance_right">
              <b-button type="button" class="button button-dark is-light mx-auto mt-0"
                @click="$router.push({name: 'Instance', params: {instance: instance}})">Add datatype to contract
              </b-button>
            </div>
          </div>
        </div>
        <div class="add_instance_form" v-if="tab === 'customized'">
          <b-input type="text" v-model="newDatatypeName" class="mt-5" placeholder="DATATYPE_NAME"></b-input>
          <table class="mx-auto">
            <tr>
              <th>Active</th>
              <th>Name</th>
              <th>Print</th>
              <th>Required</th>
              <th>Multiple</th>
              <th>Type</th>
              <th>Specs</th>
              <th>Delete</th>
            </tr>
            <tr v-for="(datatype, index) in customDatatypes" :key="index">
              <td>
                <b-input type="checkbox" @click="datatype.active = !datatype.active" :checked="datatype.active"></b-input>
              </td>
              <td>
                <b-input type="text" style="width:200px" placeholder="FIELD NAME" v-model="datatype.name"></b-input>
              </td>
              <td>
                <b-input type="checkbox" @click="datatype.print = !datatype.print" :checked="datatype.print"></b-input>
              </td>
              <td>
                <b-input type="checkbox" @click="datatype.required = !datatype.required" :checked="datatype.required"></b-input>
              </td>
              <td>
                <b-input type="checkbox" @click="datatype.multiple = !datatype.multiple" :checked="datatype.multiple"></b-input>
              </td>
              <td>
                <b-select  v-model="datatype.type" style="width:120px">
                  <option v-for="option in datatypeTypes" :value="option" :key="option">
                    {{ option }}
                  </option>
                </b-select>
              </td>
              <td>
                <b-input type="text" style="width:300px" v-model="datatype.specs"></b-input>
              </td>
              <td style="text-align:center">
                <img src="../assets/images/trash-icon.svg" alt="" style="cursor:pointer">
              </td>
            </tr>
            <tr>
              <td colspan="7"></td>
              <td style="display:flex;justify-content:center">
                <b-button type="button" class="button-dark is-light mr-0 ml-4" style="background:#111!important;color:white!important;height: 3rem;
    text-align: center;
    margin: auto!important;">
                  <font-awesome-icon icon="fa-solid fa-plus" style="font-size:23px" />
                </b-button>
              </td>
            </tr>
          </table>
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
        available: {},
        names: [],
        loading: true,
        tab: 'list',
        newDatatypeName: '',
        preCompiledDatatypes: [{
          name: 'Blog',
          attrs: [{
              name: 'Title'
            },
            {
              name: 'Description'
            },
            {
              name: 'Image'
            },
            {
              name: 'Date'
            }
          ]
        }, {
          name: 'Product',
          attrs: [{
              name: 'Title'
            },
            {
              name: 'Description'
            },
            {
              name: 'Image'
            },
            {
              name: 'Price'
            }
          ]
        }],
        datatypeTypes: ['text', 'textarea', 'file', 'checkbox'],
        customDatatypes: [
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
        ]
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
              app.loading = false
              await app.fetchDatatypes();
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
    },
    async mounted() {
      document.getElementById('app').style.background = '#EDEDED'
      await this.connect()
    }
  }
</script>