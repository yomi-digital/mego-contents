<template>
  <div id="instance">
    <div class="instances_loading" v-if="overlayLoading && loading">
      <font-awesome-icon icon="fa-solid fa-circle-notch" style="font-size:25px" class="fa-spin" />
    </div>
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
          Deployed at: <a :href="explorer_url+'/address/'+instance" target="_blank"
            style="margin-right:1rem">{{instance.substr(0, 5) +'...'+ instance.substr(-3)}}</a> Headless endpoint: <a
            :href="contents_api+'/contents/'+instance" target="_blank">api.mego.cx/c...{{instance.substr(-3)}}</a></p>
        <p v-if="loading">
          Deployed at: 0x
          <font-awesome-icon icon="fa-solid fa-circle-notch" style="font-size:25px" class="fa-spin ml-3" />
        </p>
      </div>
      <div class="instances_header">
        <h2 class="has-text-weight-semibold">
          {{(datatypeCreated) ? newDatatypeName.toUpperCase() : (tab!== 'list') ? 'ADD NEW DATATYPE' : 'AVAILABLE DATATYPES'}}
          <!-- <b-button type="button"
            class="button-dark is-light mr-0 ml-4" style="background:#111!important;color:white!important">
            <font-awesome-icon icon="fa-solid fa-plus" style="font-size:24px" />
          </b-button> -->
        </h2>
        <div style="display:flex;margin-right:0;margin-left:auto">
          <p class="tab" :style="(tab === 'pre-compiled') ? 'color: black; font-weight: 800;' : ''"
            @click="tab = 'pre-compiled'; newDatatypeName = ''; datatypeCreated = false" v-if="tab !== 'list'">
            pre-compiled</p>
          <p class="tab" :style="(tab === 'customized') ? 'color: black; font-weight: 800;' : ''"
            @click="(!modelsLoading || models.length > 0) ? tab = 'customized' : ''" v-if="tab !== 'list'">
            customized</p>
          <b-button type="button button-dark is-light ml-auto mr-0 mt-1"
            style="background:#111!important;color:white!important" class="button" v-if="tab === 'list'"
            @click="tab = 'pre-compiled'; newDatatypeName = ''; datatypeCreated = false">
            ADD NEW DATATYPE
          </b-button>
          <b-button type="button button-dark is-light ml-auto mr-0 mt-1"
            style="background:#111!important;color:white!important" class="button" v-if="tab !== 'list'"
            @click="tab = 'list'; datatypeSelected = {}; newDatatypeName = ''; datatypeCreated = false">
            VIEW ALL DATATYPES
          </b-button>
        </div>

      </div>
      <div class="no_instances is-size-5"
        v-if="!loading && Object.keys(datatypes[instance]).length === 0 && tab == 'list'">
        You have no datatypes in this instance
      </div>
      <div class="instances_list"
        v-if="tab === 'list' && (datatypes[instance] ? Object.keys(datatypes[instance]).length > 0 : false )">
        <div class="instance" v-for="datatype in Object.keys(datatypes[instance])" :key="datatype">
          <div class="instance_left">
            <h3 class="my-2"><span style="font-weight:bold;color:black;font-size:22px;">{{(datatype.indexOf('__') > 0) ?
            datatype.slice(datatype.indexOf('__')+2, 99999) : datatype}}</span>
            </h3>
            <p v-for="attr in datatypes[instance][datatype].fields" :key="attr.name" v-html="attr.name"></p>
            <p
              v-if="datatypes[instance][datatype] ? datatypes[instance][datatype].fields ? datatypes[instance][datatype].fields.length === 0 : false : false">
              <i style="color:#444">No fields</i>
            </p>
          </div>
          <div class="instance_right">
            <b-button type="button" class="button button-dark is-light mx-auto mt-0"
              style="margin: 0 .5rem!important; width: 50px;"
              @click="newDatatypeName = (datatype.indexOf('__') > 0) ? datatype.slice(datatype.indexOf('__')+2, 99999) : datatype; datatypeCreated = true; tab = 'customized'; datatypeSelected = {name: datatype, datatypes: datatypes[instance][datatype].fields}">
              <img src="../assets/images/pencil.svg" style="transform:scale(1.5) translateY(1px)" alt="">
            </b-button>
            <b-button type="button" class="button button-dark is-light mx-auto mt-0"
              style="margin: 0 .5rem!important; width: 50px;"
              @click="() => {modals.removeDatatype = true;removeDatatype(datatype)}"><img
                src="../assets/images/trash-icon.svg" alt="" style="transform:translateY(2px)">
            </b-button>

          </div>
        </div>
      </div>
      <div class="instances_list" v-if="loading">
        <div class="instance" v-for="i in 3" :key="i">
          <div class="instance_left">
            <h3 class="my-2">
              <div class="loading_box"
                style="width:100px;height:20px;display: inline-block;filter: drop-shadow(0 0 0 black);"></div>
            </h3>
            <div class="loading_box mt-1" style="width:100px;height: 14px; filter: contrast(0.1); opacity: .35;"></div>
            <div class="loading_box mt-3" style="width:100px;height: 14px; filter: contrast(0.1); opacity: .35;"></div>
            <div class="loading_box mt-3" style="width:100px;height: 14px; filter: contrast(0.1); opacity: .35;"></div>
          </div>
          <div class="instance_right">
            <div class="loading_box" style="margin: 0 .5rem!important; width: 50px;height: 40px;"></div>
            <div class="loading_box" style="margin: 0 .5rem!important; width: 50px;height: 40px;"></div>
          </div>
        </div>
        <div class="loading_box" style="width:100%"></div>
      </div>
      <div class="add_instance_container"
        v-if="(!modelsLoading || models.length > 0) && (tab === 'pre-compiled' || tab === 'customized')">
        <div class="add_instance_list instances_list" v-if="tab === 'pre-compiled'">
          <div style="text-align:center"
            v-if="!modelsLoading && models.filter(el => { return Object.keys(datatypes[instance]).find(dt => dt===el.name)===undefined}).length===0">
            <p class="is-size-5 mt-6">You have no pre-compiled or you've already added all of your available
              pre-compiled</p>
            <p class="is-size-5 my-3">You can create your custom datatype by clicking on the <a
                style="color:black;text-decoration: underline;" @click="tab = 'customized'">customized</a> tab</p>
          </div>
          <div class="instance"
            v-for="datatype in models.filter(el => { return Object.keys(datatypes[instance]).find(dt => dt===el.name)===undefined})"
            :key="datatype.name">
            <div class="instance_left">
              <h3 class="my-2"><span style="font-weight:bold;color:black;font-size:22px;">{{(datatype.name.indexOf('__')
              > 0) ? datatype.name.slice(datatype.name.indexOf('__')+2, 99999) : datatype.name}}</span>
              </h3>
              <p v-for="attr in datatype.datatypes" :key="attr.name" v-html="attr.name"></p>
              <p v-if="datatype.datatypes.length === 0"><i style="color:#444">No fields</i></p>
            </div>
            <div class="instance_right">
              <b-button type="button" class="button button-dark is-light mx-auto mt-0"
                style="margin: 0 .5rem!important; width: 50px;"
                @click="() => {addDatatype(datatype.name);modals.addDatatype = true;}">
                <font-awesome-icon icon="fa-solid fa-plus" style="font-size:20px" />
              </b-button>
              <b-button type="button" class="button button-dark is-light mx-auto mt-0"
                style="margin: 0 .5rem!important; width: 50px;"
                @click="editCustomDatatype(datatype.name, datatype.datatypes);">
                <img src="../assets/images/pencil.svg" style="transform:scale(1.5) translateY(1px)" alt="">
              </b-button>
            </div>
          </div>
        </div>
        <div class="add_instance_form" v-if="tab === 'customized'">
          <b-input type="text" v-model="newDatatypeName" class="my-5" placeholder="DATATYPE_NAME"
            v-if="!datatypeCreated"></b-input>
          <table class="mx-auto" v-if="datatypeCreated && !datatypeJustCreated">
            <tr>
              <th style="text-align:center">Active</th>
              <th>Name</th>
              <th style="text-align:center">Print</th>
              <th style="text-align:center">Required</th>
              <th style="text-align:center">Multiple</th>
              <th>Type</th>
              <th style="text-align: center;">HTML</th>
              <th>Specs</th>
              <th style="text-align:center">Delete</th>
            </tr>
            <template v-if="!datatypeSelected.name">
              <tr v-for="(datatypeAttr, index) in customDatatypeAttrs" :key="index">
                <td>
                  <div @click="datatypeAttr.active = !datatypeAttr.active">
                    <b-input type="checkbox" :checked="datatypeAttr.active">
                    </b-input>
                  </div>
                </td>
                <td>
                  <b-input type="text" style="width:200px" placeholder="FIELD NAME" v-model="datatypeAttr.name">
                  </b-input>
                </td>
                <td>
                  <div @click="datatypeAttr.print = !datatypeAttr.print">
                    <b-input type="checkbox" :checked="datatypeAttr.print"></b-input>
                  </div>
                </td>
                <td>
                  <div @click="datatypeAttr.required = !datatypeAttr.required">
                    <b-input type="checkbox" :checked="datatypeAttr.required">
                    </b-input>
                  </div>
                </td>
                <td>
                  <div @click="datatypeAttr.multiple = !datatypeAttr.multiple">
                    <b-input type="checkbox" :checked="datatypeAttr.multiple">
                    </b-input>
                  </div>
                </td>
                <td>
                  <b-select v-model="datatypeAttr.input" style="width:120px">
                    <option v-for="option in datatypeTypes" :value="option" :key="option">
                      {{ option }}
                    </option>
                  </b-select>
                </td>
                <td>
                  <div
                    @click="datatypeAttr.input === 'textarea' ? $event.target.checked ? datatypeAttr.specs = '' : datatypeAttr.specs = 'plain' : ''">
                    <b-input type="checkbox"
                      :checked="datatypeAttr.specs !== 'plain' && datatypeAttr.input === 'textarea'"
                      :disabled="datatypeAttr.input !== 'textarea'">
                    </b-input>
                  </div>
                </td>
                <td>
                  <b-input type="text" style="width:300px" v-model="datatypeAttr.specs"></b-input>
                </td>
                <td style="text-align:center">
                  <img src="../assets/images/trash-icon.svg" alt=""
                    :style="(customDatatypeAttrs.length > 1) ? 'cursor:pointer' : 'cursor:default;opacity:.5'"
                    @click="customDatatypeAttrs.length > 1 ? modals.removeDatatypeAttr = index : ''">
                </td>
              </tr>
            </template>
            <template v-if="datatypeSelected.name">
              <tr v-for="(datatypeAttr, index) in datatypeSelected.datatypes" :key="index">
                <td>
                  <div @click="datatypeAttr.active = !datatypeAttr.active">
                    <b-input type="checkbox" :checked="datatypeAttr.active">
                    </b-input>
                  </div>
                </td>
                <td>
                  <b-input type="text" style="width:200px" placeholder="FIELD NAME" v-model="datatypeAttr.name">
                  </b-input>
                </td>
                <td>
                  <div @click="datatypeAttr.print = !datatypeAttr.print">
                    <b-input type="checkbox" :checked="datatypeAttr.print"></b-input>
                  </div>
                </td>
                <td>
                  <div @click="datatypeAttr.required = !datatypeAttr.required">
                    <b-input type="checkbox" :checked="datatypeAttr.required">
                    </b-input>
                  </div>
                </td>
                <td>
                  <div @click="datatypeAttr.multiple = !datatypeAttr.multiple">
                    <b-input type="checkbox" :checked="datatypeAttr.multiple">
                    </b-input>
                  </div>
                </td>
                <td>
                  <b-select v-model="datatypeAttr.input" style="width:120px">
                    <option v-for="option in datatypeTypes" :value="option" :key="option">
                      {{ option }}
                    </option>
                  </b-select>
                </td>
                <td>
                  <div
                    @click="datatypeAttr.input === 'textarea' ? $event.target.checked ? datatypeAttr.specs = '' : datatypeAttr.specs = 'plain' : ''">
                    <b-input type="checkbox"
                      :checked="datatypeAttr.specs !== 'plain' && datatypeAttr.input === 'textarea'"
                      :disabled="datatypeAttr.input !== 'textarea'">
                    </b-input>
                  </div>
                </td>
                <td>
                  <b-input type="text" style="width:300px" v-model="datatypeAttr.specs"></b-input>
                </td>
                <td style="text-align:center">
                  <img src="../assets/images/trash-icon.svg" alt=""
                    :style="(datatypeSelected.datatypes.length > 1) ? 'cursor:pointer' : 'cursor:default;opacity:.5'"
                    @click="datatypeSelected.datatypes.length > 1 ? modals.removeDatatypeAttr = index : ''">
                </td>
              </tr>
            </template>
            <tr>
              <td colspan="8"></td>
              <td style="display:flex;justify-content:center">
                <b-button type="button" class="button-dark is-light mr-0 ml-4"
                  style="background:#111!important;color:white!important;height: 3rem;text-align: center;margin: auto!important;"
                  @click="(datatypeSelected.name) ? datatypeSelected.datatypes.push({
                    active: false,
                    name: '',
                    print: false,
                    required: false,
                    multiple: false,
                    input: 'text',
                    specs: ''
                  }) : customDatatypeAttrs.push({
                    active: false,
                    name: '',
                    print: false,
                    required: false,
                    multiple: false,
                    input: 'text',
                    specs: ''
                  })">
                  <font-awesome-icon icon="fa-solid fa-plus" style="font-size:20px" />
                </b-button>
              </td>
            </tr>
          </table>
          <div class="mx-auto my-5" v-if="datatypeJustCreated">
            <h3 class="has-text-centered is-size-5" style="color: black;">You have created <b>{{newDatatypeName}}</b>
              successfully!</h3>
            <p class="has-text-centered is-size-5">Do you want to add to your contract?</p>
          </div>
        </div>
        <div class="pb-6 mx-auto" style="display:flex" v-if="tab === 'customized'">
          <b-button type="button" class="button-light is-dark mx-auto mt-5 px-5"
            style="color:black!important;border:1px solid black!important"
            v-if="!datatypeCreated && !datatypeJustCreated"
            @click="() => {modals.addDatatype = true;createModel(newDatatypeName)}">
            CREATE NEW DATATYPE
          </b-button>
          <b-button type="button" class="button-light is-dark mx-auto mt-5 px-5"
            style="color:black!important;border:1px solid black!important" v-if="datatypeJustCreated"
            @click="() => {modals.addDatatype = true;addDatatype(datatypeJustCreated)}">
            ADD TO CONTRACT
          </b-button>
          <b-button type="button" class="button-light is-dark mx-auto mt-5 px-5"
            :style="(modelsLoading) ? 'color:black!important;border:1px solid black!important;opacity:.5' : 'color:black!important;border:1px solid black!important;'"
            v-if="datatypeCreated && datatypeSelected.name && !datatypeJustCreated"
            @click="() => {if(!modelsLoading) {modals.addDatatype = true;populateDatatype(newDatatypeName, false)}}">
            UPDATE DATATYPE
            <font-awesome-icon icon="fa-solid fa-circle-notch" style="font-size:16px;" class="fa-spin"
              v-if="modelsLoading" />
          </b-button>
          <b-button type="button" class="button-light is-dark mx-auto mt-5 px-5"
            :style="(modelsLoading) ? 'color:black!important;border:1px solid black!important;opacity:.5' : 'color:black!important;border:1px solid black!important;'"
            v-if="datatypeCreated && !datatypeSelected.name && !datatypeJustCreated"
            @click="() => {if(!modelsLoading) {modals.addDatatype = true;populateDatatype(newDatatypeName, true)}}">
            CREATE DATATYPE
            <font-awesome-icon icon="fa-solid fa-circle-notch" style="font-size:16px;" class="fa-spin"
              v-if="modelsLoading" />
          </b-button>
        </div>
      </div>
      <div class="add_instance_container" v-if="modelsLoading && tab === 'pre-compiled'">
        <div class="add_instance_list instances_list" v-if="tab === 'pre-compiled'">
          <div class="instance" v-for="i in 3" :key="i">
            <div class="instance_left">
              <h3 class="my-2">
                <div class="loading_box"
                  style="width:100px;height:20px;display: inline-block;filter: drop-shadow(0 0 0 black);"></div>
              </h3>
              <div class="loading_box mt-1" style="width:100px;height: 14px; filter: contrast(0.1); opacity: .35;">
              </div>
              <div class="loading_box mt-3" style="width:100px;height: 14px; filter: contrast(0.1); opacity: .35;">
              </div>
              <div class="loading_box mt-3" style="width:100px;height: 14px; filter: contrast(0.1); opacity: .35;">
              </div>
            </div>
            <div class="instance_right">
              <div class="loading_box" style="margin: 0 .5rem!important; width: 50px;height: 40px;"></div>
              <div class="loading_box" style="margin: 0 .5rem!important; width: 50px;height: 40px;"></div>
            </div>
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
import { create } from "domain";
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
      contents_api: process.env.VUE_APP_CONTENTS_API,
      factory_contract: process.env.VUE_APP_FACTORY_CONTRACT,
      explorer_url: process.env.VUE_APP_EXPLORER_URL,
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
      datatypeTypes: ['text', 'textarea', 'file', 'select', 'tag'],
      preCompiledDatatypes: [], //ex. 'blog', 'nft'
      customDatatypeAttrs: [{
        active: false,
        name: '',
        print: false,
        required: false,
        multiple: false,
        input: 'text',
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
      datatypeCreated: false,
      models: [],
      datatypeSelected: {},
      modelsLoading: true,
      overlayLoading: true,
      datatypeJustCreated: ''
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
      if (network === app.network) {
        try {
          const accounts = await web3.eth.getAccounts();
          if (accounts.length > 0) {
            app.account = accounts[0];
            const factoryContract = new web3.eth.Contract(
              app.abi_factory,
              app.factory_contract
            );
            app.instances = await factoryContract.methods
              .instancesOfOwner(app.account)
              .call();
            await app.fetchDatatypes(app.instance);
            //Setting fields default active value
            Object.keys(app.datatypes[app.instance]).forEach(datatype => {
              app.datatypes[app.instance][datatype].fields.forEach((field, i) => {
                if (i !== app.datatypes[app.instance][datatype].fields.length - 1)
                  field.active = true
              })
            })
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
    async populateDatatype(datatype, justCreated = false) {
      if (datatype.indexOf('0x') !== -1) {
        datatype = datatype.slice(datatype.indexOf('__') + 2, 99999)
      }
      const app = this;
      let datatypeSigned = (app.preCompiledDatatypes.find(el => el === datatype)) ? datatype : app.account.substr(0, 5) + app.account.substr(-3) + '__' + datatype
      let originalDatatype = app.models.find(el => el.name === datatypeSigned)
      const factoryContract = new app.web3.eth.Contract(
        app.abi_factory,
        app.factory_contract
      );
      app.isWorking = true;
      try {
        let attrsArr = (app.datatypeSelected.name) ? app.datatypeSelected.datatypes : app.customDatatypeAttrs
        if (attrsArr.find(el => el.name != '') == undefined) {
          app.modals.addDatatype = false;
          app.log('danger', 'Please, fill in the name field')
        }
        else {
          for (let index of Object.keys(attrsArr)) {
            let field = attrsArr[index]
            //edited field check
            let edited = false
            if (originalDatatype) {
              for (const key of Object.keys(field)) {
                if (field[key] !== originalDatatype.datatypes[index][key]) {
                  edited = true
                }
                if (Object.keys(app.datatypes[app.instance]).find(mdl => mdl === datatypeSigned) == undefined) {
                  //If is a datatype not added to contract yet
                  let originalDatatypeFields = JSON.parse(localStorage.getItem('originalDatatypeFields'))
                  if ((originalDatatypeFields && originalDatatypeFields.find(el => el.name === field.name) && originalDatatypeFields.find(el => el.name === field.name)[key] !== field[key]) || (originalDatatypeFields && !originalDatatypeFields.find(el => el.name === field.name))) {
                    edited = true
                  }
                }
              }
            }
            else {
              edited = true
            }
            if (edited) {
              app.workingMessage = "Adding <b>" + field.name + "</b> in " + datatype + " <br />Please confirm transaction in your wallet.";
              console.log("Editing ", datatypeSigned)
              const receipt = await factoryContract.methods
                .editDatatypeInModel(datatypeSigned, index, field.active, field.name, field.print, field.required, field.multiple, field.input, field.specs)
                .send({
                  from: app.account,
                })
                .on("transactionHash", (tx) => {
                  app.workingMessage =
                    "Adding <b>" + field.name + "</b> in " + datatype + " <br />Waiting for confirmations at " + tx;
                });
              console.log("ADD_TYPE_RECEIPT", receipt);
            }
          }
          //Reset extra previous fields if present to default values
          if (originalDatatype && Object.keys(attrsArr).length < originalDatatype.datatypes.length) {
            for (let i = Object.keys(attrsArr).length; i < originalDatatype.datatypes.length - 1; i++) {
              app.workingMessage = "Removing <b>" + originalDatatype.datatypes[i].name + "</b> in " + datatype + " <br />Please confirm transaction in your wallet.";
              const receipt = await factoryContract.methods
                .editDatatypeInModel(datatypeSigned, i, false, '', false, false, false, '', '')
                .send({
                  from: app.account,
                })
                .on("transactionHash", (tx) => {
                  app.workingMessage =
                    "Removing <b>" + originalDatatype.datatypes[i].name + "</b> in " + datatype + " <br />Waiting for confirmations at " + tx;
                });
              console.log("DELETE_PREVIOUS_TYPE_RECEIPT", receipt);
            }
          }
          if (justCreated) {
            app.datatypeJustCreated = datatypeSigned
            app.modals.addDatatype = false;
            app.isWorking = false
          }
          else {
            window.location.reload();
          }
        }
      } catch (e) {
        alert(e.message);
        app.isWorking = false;
      }
    },
    async addDatatype(datatype) {
      if (datatype.indexOf('0x') !== -1) {
        datatype = datatype.slice(datatype.indexOf('__') + 2, 99999)
      }
      const app = this;
      const contentsContract = new app.web3.eth.Contract(
        app.abi_contents,
        app.instance
      );
      app.isWorking = true;
      try {
        app.workingMessage = "Adding type <b>" + datatype + "</b> to your instance <br />Please confirm transaction in your wallet.";
        let datatypeSigned = (app.preCompiledDatatypes.find(el => el === datatype)) ? datatype : app.account.substr(0, 5) + app.account.substr(-3) + '__' + datatype
        console.log("Adding type:", datatypeSigned);
        const receipt = await contentsContract.methods
          .addType(datatypeSigned)
          .send({
            from: app.account
          })
          .on("transactionHash", (tx) => {
            app.workingMessage =
              "Adding type <b>" + datatype + "</b> to your instance<br />Waiting for confirmations at " + tx;
          });
        console.log("ADD_TYPE_RECEIPT", receipt);
        window.location.reload();
      } catch (e) {
        alert(e.message);
        app.isWorking = false;
      }
    },
    fetchDatatypes(instance) {
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
          app.factory_contract
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
                datatypes.push({
                  name: datatype._name,
                  print: datatype._print,
                  required: datatype._required,
                  multiple: datatype._multiple,
                  input: datatype._input,
                  specs: datatype._specs
                });
                t++;
                if (datatype._name.length === 0) {
                  finished = true;
                }
              }
              app.datatypes[instance][result] = {
                fields: datatypes,
                modelIndex: i
              };
              app.overlayLoading = false
            }
            i++;
          } catch (e) {
            exists = false;
          }
        }
        response(true);
      });
    },
    async removeDatatype(datatype) {
      if (datatype.indexOf('0x') !== -1) {
        datatype = datatype.slice(datatype.indexOf('__') + 2, 99999)
      }
      const app = this;
      const contentsContract = new app.web3.eth.Contract(
        app.abi_contents,
        app.instance
      );
      app.isWorking = true;
      try {
        app.workingMessage = "Removing <b>" + datatype + "</b> <br />Please confirm transaction in your wallet.";
        let datatypeSigned = (app.preCompiledDatatypes.find(el => el === datatype)) ? datatype : app.account.substr(0, 5) + app.account.substr(-3) + '__' + datatype
        const receipt = await contentsContract.methods
          .removeType(datatypeSigned, app.datatypes[app
            .instance][datatypeSigned].modelIndex)
          .send({
            from: app.account,
          })
          .on("transactionHash", (tx) => {
            app.workingMessage =
              "Removing <b>" + datatype + "</b> <br />Waiting for confirmations at " + tx;
          });
        console.log("ADD_TYPE_RECEIPT", receipt);
        app.fetchDatatypes(app.instance);
        app.isWorking = false;
        window.location.reload();
      } catch (e) {
        alert(e.message);
        app.isWorking = false;
      }
    },
    resetCustomDatatypesAttrs() {
      let newArr = []
      if (!this.datatypeSelected.name) {
        this.customDatatypeAttrs.forEach((attr, index) => {
          if (index !== this.modals.removeDatatypeAttr) {
            newArr.push(attr)
          }
        })
        this.customDatatypeAttrs = newArr
      }
      else {
        this.datatypeSelected.datatypes.forEach((attr, index) => {
          if (index !== this.modals.removeDatatypeAttr) {
            newArr.push(attr)
          }
        })
        this.datatypeSelected.datatypes = newArr
      }
      this.modals.removeDatatypeAttr = -1
    },
    async createModel(datatype) {
      const app = this;
      let datatypeSigned = (app.preCompiledDatatypes.find(el => el === datatype)) ? datatype : app.account.substr(0, 5) + app.account.substr(-3) + '__' + datatype
      //Unique check
      if (app.models.find(el => el.name === datatypeSigned)) {
        app.log('danger', 'A datatype with that name exists yet!')
        app.modals.addDatatype = false;
      }
      else {
        const factoryContract = new app.web3.eth.Contract(
          app.abi_factory,
          app.factory_contract
        );
        app.isWorking = true;
        try {
          app.workingMessage = "Creating <b>" + datatype + "</b> datatype <br />Please confirm transaction in your wallet.";
          console.log("Creating type:", datatypeSigned);
          const receipt = await factoryContract.methods
            .createModel(datatypeSigned)
            .send({
              from: app.account
            })
            .on("transactionHash", (tx) => {
              app.workingMessage =
                "Creating <b>" + datatype + "</b> datatype <br />Waiting for confirmations at " + tx;
            });
          console.log("ADD_TYPE_RECEIPT", receipt);
          app.fetchDatatypes(app.instance);
          app.isWorking = false;
          app.datatypeCreated = true
          app.modals.addDatatype = false;
        } catch (e) {
          alert(e.message);
          app.isWorking = false;
        }
      }
    },
    async fetchModels() {
      const app = this;
      const factoryContract = new app.web3.eth.Contract(
        app.abi_factory,
        app.factory_contract
      );
      let ended = false
      let k = 0
      while (!ended) {
        try {
          const created = await factoryContract.methods.created(k).call()
          let sign = created.split('__')[0]
          if (app.account.substr(0, 5) + app.account.substr(-3) === sign) {
            let datatypes = []
            let finished = false
            let i = 0
            while (!finished) {
              const datatype = await factoryContract.methods.returnModelType(created, i).call()
              datatypes.push({
                active: datatype._active,
                name: datatype._name,
                print: datatype._print,
                required: datatype._required,
                multiple: datatype._multiple,
                input: datatype._input,
                specs: datatype._specs
              })
              if (datatype._name.length === 0) {
                finished = true
              }
              i++
            }
            app.models.push({
              index: k,
              name: created,
              datatypes: datatypes
            })
          }
          k++
          if (created.length === 0) {
            ended = true
          }
        } catch (e) {
          ended = true
        }
      }
    },
    log(type, content) {
      this.$buefy.snackbar.open({
        type: "is-" + type,
        message: content,
        pauseOnHover: true,
      });
    },
    editCustomDatatype(datatype, datatypesToSave) {
      const app = this
      localStorage.setItem('originalDatatypeFields', JSON.stringify(datatypesToSave))
      app.newDatatypeName = (datatype.indexOf('__') > 0) ? datatype.slice(datatype.indexOf('__') + 2, 99999) : datatype;
      app.datatypeCreated = true;
      app.tab = 'customized';
      let datatypes = app.models.find(el => el.name === datatype).datatypes
      datatypes.forEach((field, i) => {
        if (i !== datatypes.length - 1)
          field.active = true
      })
      app.datatypeSelected = { name: datatype, datatypes: datatypes }
    }
  },
  async mounted() {
    document.getElementById('app').style.background = '#EDEDED'
    document.getElementById('navbar_group').children[1].style.background = '#EDEDED'
    await this.connect()
    this.loading = false
    await this.fetchModels()
    this.modelsLoading = false
  }
}
</script>