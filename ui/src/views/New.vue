<template>
  <div class="home">
    <div style="position:relative">
      <div class="modal_container" v-if="modals.prepare">
        <div class="modal">
          <img src="../assets/images/close-icon.svg" alt="Close" @click="modals.prepare = false">
          <h2 v-html="workingMessage"></h2>
          <!-- <p>Define the name and the ticker of the instance.</p> -->
          <font-awesome-icon icon="fa-solid fa-circle-notch" style="font-size:20px;margin-top: .2rem;" class="fa-spin"
            v-if="isWorking" />
        </div>
      </div>
      <div class="instances_container" style="margin-top:-1rem">
        <div class="instance_info" v-if="loading || Object.keys(datatypes).length > 0">
          <h2 :style="(loading) ? 'opacity:.5' : ''">CREATE YOUR <div v-if="loading" class="loading_box"
              style="width:100px;height:35px;display:inline-block;"></div> <span class="selected_model" v-if="!loading">
              {{(category.indexOf('__') > 0) ? category.slice(category.indexOf('__')+2, 99999).toUpperCase() :
              category}}
              <div :class="{new_model_select:true, new_model_select_open:selectOpened}">
                <p v-for="el in Object.keys(datatypes).filter(item => item !== category)" :value="el" :key="el"
                  @click="() => {category = el; selectOpened = false}">
                  {{(el.indexOf('__') > 0) ? el.slice(el.indexOf('__')+2, 99999).toUpperCase() : el }}
                </p>
                <p class="is-size-6" style="color:#9999;width: 150px;"
                  v-if="Object.keys(datatypes).filter(item => item !== category).length === 0">No more datatypes</p>
              </div>
            </span> <img style="margin-bottom:4px;cursor: pointer;" @click="selectOpened = !selectOpened"
              src="../assets/images/arrow.svg" alt=""></h2>
        </div>
        <div class="instance_info" v-if="!loading && Object.keys(datatypes).length === 0">
          <h2>Add at least one datatype to your instance first</h2>
          <b-button type="button" class="button-dark is-light mx-3 mt-5"
            style="background:#111!important;color:white!important" @click="$router.push({name: 'Instances'})">
            ADD NOW
          </b-button>
        </div>
        <router-link :to="{name: 'Pricing'}" v-if="!canMint" style="color:black;text-align: center;">You cannot create
          any content at the moment
          <font-awesome-icon icon="fa-solid fa-circle-exclamation"
            style="font-size:15px;color: #ff850f;margin-bottom: .1rem;" />
        </router-link>
      </div>

      <div v-if="!ipfsNft && content[category]" class="new_model_form">
        <div v-for="input in datatypes[category]" v-bind:key="input.name">
          <b-field v-if="input.input === 'text'" :label="input.name.toUpperCase()">
            <b-input v-model="content[category][input.name]"></b-input>
          </b-field>
          <b-field v-if="input.input === 'textarea' && input.specs !== 'plain'" :label="input.name.toUpperCase()">
            <VueEditor v-model="content[category][input.name]" />
          </b-field>
          <b-field v-if="input.input === 'textarea' && input.specs === 'plain'" :label="input.name.toUpperCase()">
            <b-input v-model="content[category][input.name]" type="textarea"></b-input>
          </b-field>
          <b-field v-if="input.input === 'select'" v-bind:key="input.name" :label="input.name.toUpperCase()">
            <b-select v-model="content[category][input.name]" expanded>
              <option v-for="categ in input.specs
              .replace('[', '')
              .replace(']', '')
              .split(',')" :value="categ" :key="categ">
                {{ categ }}
              </option>
            </b-select>
          </b-field>
          <b-field v-if="input.input === 'tag'" :label="input.name.toUpperCase()">
            <b-taginput v-model="content[category][input.name]" ellipsis icon="label" placeholder="Add a tag"
              aria-close-label="Delete this tag">
            </b-taginput>
          </b-field>
          <b-field v-if="input.input === 'file' && !input.multiple" v-bind:key="input.name"
            :label="input.name.toUpperCase()">
            <b-upload v-model="content[category][input.name]" expanded drag-drop>
              <section class="section">
                <div class="content has-text-centered">
                  <p v-if="content[category][input.name] ? content[category][input.name].name === undefined : true">
                    Drop your file here or click to upload.<br />Supported
                    files: jpg, png, gif, mp4.
                  </p>
                  <p
                    v-if="content[category][input.name] ? content[category][input.name].name !== undefined : content[category][input.name]">
                    Chosen image is <b>{{ content[category][input.name].name }}</b>.<br />Click or drop another file to
                    change it.
                  </p>
                </div>
              </section>
            </b-upload>
          </b-field>
          <b-field v-if="input.input === 'file' && input.multiple" v-bind:key="input.name"
            :label="input.name.toUpperCase()">
            <b-upload v-model="content[category][input.name]" expanded drag-drop multiple>
              <section class="section">
                <div class="content has-text-centered">
                  <p v-if="content[category][input.name] ? content[category][input.name].length===0 : true">
                    Drop your files here or click to upload.<br />Supported
                    files: jpg, png, gif, mp4.
                  </p>
                  <p
                    v-if="content[category][input.name] ? content[category][input.name].length : content[category][input.name]">
                    You have uploaded <b>{{ content[category][input.name].length }} files</b>.<br />Click or drop other
                    files to
                    change them.
                  </p>
                </div>
              </section>
            </b-upload>
          </b-field>
          <br />
        </div>
        <b-button type="button" class="button-light is-dark mx-auto mt-5 px-6"
          style="color:black!important;border:1px solid black!important" v-if="!isWorking && !ipfsNft && canMint"
          @click="prepare">
          PREPARE METADATA
        </b-button>
        <b-button type="button" class="button-light is-dark mx-auto mt-5 px-6"
          style="color:black!important;border:1px solid black!important" disabled
          v-if="!isWorking && !ipfsNft && !canMint">
          PREAPARE METADATA
        </b-button>
      </div>
      <div v-if="ipfsNft" style="text-align: center; padding: 3rem 0;font-size:20px">
        <span>Metadata are generated, please double check them before mint at</span><br />
        <a target="_blank" style="color:black;text-decoration:underline" :href="'/#/preview/' + ipfsNft">{{ ipfsNft
        }}</a><br /><br />
        <b-button type="button" class="button-dark is-light mx-3 mt-5" v-if="!isWorking"
          style="background:#111!important;color:white!important" @click="mint">
          MINT CONTENT
        </b-button>
      </div>
    </div>
    <div v-if="loading" class="mx-auto" style="text-align:center">
      <p>
        <font-awesome-icon icon="fa-solid fa-circle-notch" class="fa-spin mt-6" style="font-size:24px" />
      </p>
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
import Web3Modal, { local } from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import {
  VueEditor
} from "vue2-editor";
const FormData = require("form-data");
const abi_factory = require("../abis/factory.json");
const abi_contents = require("../abis/contents.json");

export default {
  name: "Home",
  components: {
    VueEditor,
  },
  data() {
    return {
      infuraId: process.env.VUE_APP_INFURA_ID,
      umiUrl: process.env.VUE_APP_UMI_API,
      axios: axios,
      abi_factory: abi_factory,
      abi_contents: abi_contents,
      contract: '',
      instance: "",
      network: '',
      datatypes: {},
      web3: {},
      account: "",
      content: {},
      instances: [],
      ipfsFile: "",
      category: "",
      isWorking: false,
      loading: true,
      workingMessage: "",
      ipfsNft: "",
      selectOpened: false,
      modals: {
        prepare: false
      },
      canMint: true
    };
  },
  async mounted() {
    document.getElementById('navbar_group').children[1].style.background = 'white'
    document.getElementById('app').style.background = 'white'
    const app = this;
    let chain = localStorage.getItem('chain')
    let chains = localStorage.getItem('chains')
    if (chain && chains) {
      chains = JSON.parse(chains)
      app.contract = chains[chain].contract
      app.network = chains[chain].network
    }
    await app.connect();
    for (const el of Object.keys(app.datatypes)) {
      app.content[el] = app.datatypes[el]
    }
    setInterval(function () {
      app.$forceUpdate();
    }, 100);
    let mintCheckInterval = setInterval(() => {
      //checking if can mint
      if (localStorage.getItem('canMint') != null && JSON.parse(localStorage.getItem('canMint')) === false && app.canMint) {
        app.canMint = false
        clearInterval(mintCheckInterval)
      }
    }, 500)
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
            app.instance = localStorage.getItem("instance");
            await app.fetchModels();
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
            if (app.category.length === 0) {
              app.category = result;
            }
            let datatypes = [];
            console.log("Model found:", result);
            let finished = false;
            let t = 0;
            while (!finished) {
              const datatype = await factoryContract.methods
                .returnModelType(result, t)
                .call();
              if (datatype._active) {
                if (datatype._input !== "file") {
                  app.content[datatype._name] = "";
                } else {
                  app.content[datatype._name] = {};
                }
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
      app.loading = false;
    },
    async prepare() {
      const app = this;
      let isValid = true
      let content = app.content[app.category]
      let fields = content.map(el => (el.name) ? el.name : false)
      for (const field of fields) {
        if (Object.keys(content).find(el => el === field) == undefined) {
          isValid = false
        }
        if (content.find(el => el.name === field && el.required) && content[field] == '') {
          isValid = false
        }
      }
      if (isValid && !app.isWorking) {
        app.isWorking = true;
        app.workingMessage = "Validating input data..";
        app.modals.prepare = true
        let metadata = {};
        for (let k in app.datatypes[app.category]) {
          const datatype = app.datatypes[app.category][k];
          if (datatype.input !== "file") {
            metadata[datatype.name] = content[datatype.name];
          } else {
            metadata[datatype.name] = []
            let files = []
            if (!content[datatype.name].length) {
              files.push(content[datatype.name])
            }
            else if (content[datatype.name].length) {
              for (const fl of content[datatype.name]) {
                files.push(fl)
              }
            }
            for (const file of files) {
              const ext =
                file.name.split(".")[
                file.name.split(".").length - 1
                ];
              console.log("Extension file is:", ext);
              const supported = ["gif", "png", "jpg", "jpeg", "mp4"];
              if (supported.indexOf(ext) !== -1) {
                app.log("success", "File is valid, uploading on IPFS..");
                const formData = new FormData();
                formData.append("file", file);
                formData.append("name", file.name);
                try {
                  let ipfsImageUpload = await axios({
                    method: "post",
                    url: app.umiUrl + "/ipfs/upload",
                    data: formData,
                    headers: {
                      "Content-Type": "multipart/form-data",
                    },
                  });
                  if (
                    ipfsImageUpload.data.error !== undefined &&
                    ipfsImageUpload.data.error === false
                  ) {
                    metadata[datatype.name].push("ipfs://" + ipfsImageUpload.data.ipfs_hash)
                  } else {
                    app.isWorking = false;
                    app.modals.prepare = false
                    app.log("danger", "Upload on IPFS failed, please retry.");
                  }
                } catch (e) {
                  app.isWorking = false;
                  app.modals.prepare = false
                  app.log("danger", "Upload on IPFS failed, please retry.");
                }
              } else {
                app.log(
                  "danger",
                  "Extension is not allowed, please retry with a different file."
                );
                app.isWorking = false;
                app.modals.prepare = false
              }
            }
          }
        }
        // Uploading final metadata to IPFS
        console.log("METADATA", metadata);
        metadata.author = app.account;
        metadata.timestamp = new Date().getTime();
        metadata.category = app.category;
        metadata.name = (metadata.name) ? metadata.name : (metadata.title) ? metadata.title : 'MEGO CONTENT'
        metadata.description = (metadata.description) ? metadata.description :
          'This NFT represents a decentralised content on MEGO'
        metadata.image = (metadata.image) ? metadata.image : 'ipfs://bafkreiblyp34mtsvwk2tv4u7cwq6wdj5lkfgpmvkytvkzq4xlhwybebrhe'
        app.workingMessage = "Creating final NFT metadata..";
        let ipfNftUpload = await axios({
          method: "post",
          url: app.umiUrl + "/ipfs/nft",
          data: {
            provider: "pinata",
            nft: metadata,
          },
        });
        if (
          ipfNftUpload.data.error !== undefined &&
          ipfNftUpload.data.error === false
        ) {
          app.ipfsNft = ipfNftUpload.data.ipfs_hash;
          app.isWorking = false;
          app.modals.prepare = false
        } else {
          app.isWorking = false;
          app.modals.prepare = false
          app.log("danger", "Upload on IPFS failed, please retry.");
        }
      } else {
        app.log("danger", "Please fill all required fields.");
        app.isWorking = false;
        app.modals.prepare = false
      }
    },
    async mint() {
      const app = this;
      if (!app.isWorking) {
        app.isWorking = true;
        app.workingMessage = "Minting NFT, please continue with your wallet..";
        app.modals.prepare = true
        const network = await app.web3.eth.net.getId();
        console.log("Found network:", network);
        if (network === app.network) {
          try {
            const factoryContract = new app.web3.eth.Contract(
              app.abi_factory,
              app.contract
            );
            await factoryContract.methods
              .dropContent(app.instance, app.ipfsNft, app.category)
              .send({
                from: app.account,
                gas: 300000
              })
              .on("transactionHash", (tx) => {
                app.workingMessage = "Found pending transaction at: " + tx;
              });
            app.log(
              "success",
              "Minting was successful, redirecting to draft page.."
            );
            //app.isWorking = false;
            app.modals.prepare = false
            setTimeout(function () {
              window.location.href = "/#/drafts";
            }, 2000);
          } catch (e) {
            console.log("MINTING FAILED:", e);
            app.log("danger", "Minting failed, please retry..");
            app.isWorking = false;
            app.modals.prepare = false
          }
        } else {
          alert(
            "Wrong network, please connect to correct one (" +
            app.network +
            ")!"
          );
        }
      }
    },
  },
};
</script>
