<template>
  <div class="home manage_page">
    <div class="modal_container" v-if="modals.working">
      <div class="modal">
        <img src="../assets/images/close-icon.svg" alt="Close" @click="modals.working = false">
        <h2 v-html="workingMessage"></h2>
        <!-- <p>Define the name and the ticker of the instance.</p> -->
        <font-awesome-icon icon="fa-solid fa-circle-notch" style="font-size:20px;margin-top: .2rem;" class="fa-spin"
          v-if="isWorking" />
      </div>
    </div>
    <div class="modal_container" v-if="modals.deleteImage.index">
      <div class="modal">
        <img src="../assets/images/close-icon.svg" alt="Close" @click="modals.deleteImage = {}">
        <h2>Are you sure you want to delete the selected image?</h2>
        <!-- <p>Define the name and the ticker of the instance.</p> -->
        <div style="display:flex">
          <b-button type="button" class="button-light is-dark mx-3 mt-5"
            style="color:black!important;border:1px solid black!important" @click="modals.deleteImage = {}">
            NO
          </b-button>
          <b-button type="button" class="button-dark is-light mx-3 mt-5"
            style="background:#111!important;color:white!important"
            @click="() => {deleteImage(modals.deleteImage.name, modals.deleteImage.index);modals.deleteImage = {}}">
            YES
          </b-button>
        </div>
      </div>
    </div>
    <div class="instances_container" style="margin-top:-1rem">
      <div class="instance_info">
        <h2 v-if="loading || (!loading && Object.keys(datatypes).length > 0)" :style="(loading) ? 'opacity:.5' : ''">
          UPDATE YOUR <br
            v-if="(category.indexOf('__') > 0) ? category.slice(category.indexOf('__')+2, 99999).length>20 : category.length>20" />
          <div v-if="loading" class="loading_box" style="width:100px;height:35px;display:inline-block;">
          </div> <span class="selected_model" v-if="!loading">
            {{(category.indexOf('__') > 0) ? category.slice(category.indexOf('__')+2, 99999).toUpperCase() : category}}
            <div :class="{new_model_select:true}">
              <p v-for="el in Object.keys(datatypes)" :value="el" :key="el">
                {{(el.indexOf('__') > 0) ? el.slice(el.indexOf('__')+2, 99999).toUpperCase() : el }}
              </p>
            </div>
          </span>
        </h2>
        <h2 v-if="!loading && Object.keys(datatypes).length === 0">NFT NOT FOUND</h2>
        <p v-if="!loading && Object.keys(datatypes).length > 0">
          <span class="mr-6">Headless endpoint: <a :href="contents_api+'/contents/'+chain+'/'+instance+'/'+tokenId"
              target="_blank">api.mego.cx/c...{{instance.substr(-3)}}</a></span>
          <a style="text-decoration: underlined;color: black; font-size: 18px;" class="mr-3"
            @click="copyText('link','/share/'+chain+'/'+instance+'/'+tokenId)">
            <font-awesome-icon icon="fa-solid fa-link" style="font-size:16px;margin-top: .2rem;" class="mt-5" />
            share
          </a>
          <b-button type="button" class="button-light is-dark mx-3 mt-4"
            style="color:black!important;border:1px solid black!important"
            @click="openTab(opensea_url+'/'+instance+'/'+tokenId)">
            SEE ON OPENSEA
          </b-button>
          <b-button type="button" class="button-dark is-light mx-3 mt-4"
            style="background:#111!important;color:white!important" v-if="!freezed && account === owner"
            @click="freeze()">
            SEND LIVE
          </b-button>
          <b-button type="button" class="button-dark is-light mx-3 mt-4"
            style="background:#111!important;color:white!important;opacity:.5;cursor: not-allowed;"
            v-if="!freezed && account !== owner">
            SEND LIVE
          </b-button>
        </p>
      </div>
      <div v-if="loading">Syncing state with blockchain, please wait..</div>
    </div>
    <div v-if="!loading" style="position: relative" class="new_model_form">
      <!-- <b-field label="MODEL">
        <b-select v-model="category" disabled expanded placeholder="Select a category">
          <option v-for="category in Object.keys(datatypes)" :value="category" :key="category">
            {{ category.toUpperCase() }}
          </option>
        </b-select>
      </b-field> -->
      <div v-if="!ipfsNft">
        <div v-for="input in datatypes[category]" v-bind:key="input.name">
          <b-field v-if="input.input === 'text'" :label="input.name.toUpperCase()">
            <b-input v-model="content[input.name]"></b-input>
          </b-field>
          <b-field v-if="input.input === 'textarea' && input.specs !== 'plain'" :label="input.name.toUpperCase()">
            <VueEditor v-model="content[input.name]" />
          </b-field>
          <b-field v-if="input.input === 'textarea' && input.specs === 'plain'" :label="input.name.toUpperCase()">
            <b-input v-model="content[input.name]" type="textarea"></b-input>
          </b-field>
          <b-field v-if="input.input === 'select'" v-bind:key="input.name" :label="input.name.toUpperCase()">
            <b-select v-model="content[input.name]" expanded>
              <option v-for="category in input.specs
              .replace('[', '')
              .replace(']', '')
              .split(',')" :value="category" :key="category">
                {{ category }}
              </option>
            </b-select>
          </b-field>
          <div v-if="stored[input.name]" style="width: 100%; display: block">
            <img :src="
              stored[input.name][0].replace(
                'ipfs://',
                'https://ipfs.yomi.digital/ipfs/'
              )
            " width="100%" v-if="input.name === 'image'" />
            <template
              v-if="input.name !== 'image' && stored[input.name][0] && stored[input.name][0].indexOf('ipfs') !== -1">
              <div style="position: relative;" v-for="(src,i) in stored[input.name]" :key="i">
                <div class="iframe_close_btn" :inputName="input.name" :index="i" @click="showDeleteImageModal($event)">
                </div>
                <div class="iframe_close_btn_bg"></div>
                <iframe width="100%" height="400"
                  :src="src.replace ? src.replace('ipfs://', 'https://ipfs.yomi.digital/ipfs/') : (src != undefined) ? urlClass.createObjectURL(src) : ''"
                  frameborder="0"></iframe>
              </div>
            </template><br /><br />
          </div>
          <b-field v-if="input.input === 'tag'" :label="input.name.toUpperCase()">
            <b-taginput v-model="content[input.name]" ellipsis icon="label" placeholder="Add a tag"
              aria-close-label="Delete this tag">
            </b-taginput>
          </b-field>
          <b-field v-if="input.input === 'file' && !input.multiple && !freezed" v-bind:key="input.name"
            :label="input.name.toUpperCase()">
            <b-upload v-model="content[input.name]" expanded drag-drop>
              <section class="section">
                <div class="content has-text-centered">
                  <p v-if="content[input.name].name === undefined">
                    Drop your file here or click to upload.<br />Supported files:
                    jpg, png, gif.
                  </p>
                  <p v-if="content[input.name].name !== undefined">
                    Chosen image is <b>{{ content[input.name].name }}</b>.<br />Click or drop another file to change it.
                  </p>
                </div>
              </section>
            </b-upload>
          </b-field>
          <b-field v-if="input.input === 'file' && input.multiple" v-bind:key="input.name"
            :label="input.name.toUpperCase()">
            <b-upload v-model="stored[input.name]" expanded drag-drop multiple>
              <section class="section">
                <div class="content has-text-centered">
                  <p v-if="stored[input.name].length ? stored[input.name].length===0 : true">
                    Drop your files here or click to upload.<br />Supported
                    files: jpg, png, gif, mp4.
                  </p>
                  <p v-if="stored[input.name].length ? stored[input.name].length>0 : false">
                    You have uploaded <b>{{ stored[input.name].length }} files</b>.<br />Click or drop another
                    file to add it to them.
                  </p>
                </div>
              </section>
            </b-upload>
          </b-field>
          <br />
        </div>
        <b-button type="button" class="button-dark is-light mx-3"
          style="background:#111!important;color:white!important;width:120px;margin-top: -2rem;"
          v-if="!loading && Object.keys(datatypes).length === 0" @click="$router.push({name:'Drafts'})">
          GO BACK
        </b-button>
        <div style="display:grid;place-items:center"
          v-if="!isWorking && !ipfsNft && !freezed && Object.keys(datatypes).length > 0">
          <b-button v-if="account===owner" @click="prepare" class="button-light is-dark mx-3 mt-5"
            style="color:black!important;border:1px solid black!important;margin: auto; width: 200px;">UPDATE
          </b-button>
          <b-button v-if="account !== owner" class="button-light is-dark mx-3 mt-5"
            style="color:black!important;border:1px solid black!important;margin: auto; width: 200px;opacity: .5;cursor: not-allowed;">
            UPDATE
          </b-button>
          <p class="mt-4" v-if="account !== owner">You are a collaborator in this instance</p>
        </div>
      </div>
      <div v-if="ipfsNft" style="text-align: center; padding: 20px 0 20px 0">
        Updated metadata are generated, please double check them before mint at<br />
        <a target="_blank" style="color:black;text-decoration:underline" :href="'/#/preview/' + ipfsNft">{{ ipfsNft
        }}</a><br /><br />
        <b-button v-if="!isWorking" @click="mint" class="button-light is-dark mx-3 mt-5"
          style="color:black!important;border:1px solid black!important;margin: auto; width: 200px;">MINT NFT</b-button>
      </div>
    </div>
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
import {
  VueEditor
} from "vue2-editor";
const FormData = require("form-data");
const abi_factory = require("../abis/factory.json");
const abi_contents = require("../abis/contents.json");

export default {
  name: "Manage",
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
      opensea_url: '',
      contents_api: process.env.VUE_APP_CONTENTS_API,
      instance: "",
      network: -1,
      datatypes: {},
      web3: {},
      account: "",
      content: {},
      stored: {},
      ipfsFile: "",
      category: "",
      isWorking: false,
      loading: true,
      workingMessage: "",
      ipfsNft: "",
      tokenId: "",
      freezed: false,
      modals: {
        working: false,
        deleteImage: {}
      },
      urlClass: URL,
      owner: '',
      chain: ''
    };
  },
  async mounted() {
    const app = this;
    app.tokenId = app.$route.params.tokenId;
    this.chain = localStorage.getItem('chain')
    let chains = localStorage.getItem('chains')
    if (this.chain && chains) {
      chains = JSON.parse(chains)
      app.opensea_url = chains[this.chain].opensea
      app.contract = chains[this.chain].contract
      app.network = chains[this.chain].network
    }
    await app.connect();
    if (app.freezed) {
      app.$router.push({ name: 'View', params: { tokenId: app.tokenId } })
    }
    setInterval(function () {
      app.$forceUpdate();
    }, 1000);
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
          //alert(e.message);
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
      app.owner = await contentsContract.methods.owner().call()
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
      let tokenURI = await contentsContract.methods
        .tokenURI(app.tokenId)
        .call();
      app.freezed = await contentsContract.methods
        .metadata_freezed(tokenURI.replace("ipfs://", ""))
        .call();
      console.log("TOKEN URI IS:", tokenURI);
      let content
      try {
        content = await app.axios.get(
          tokenURI.replace("ipfs://", "https://ipfs.yomi.digital/ipfs/")
        );
        app.category = content.data.category
      }
      catch {
        app.datatypes = {}
      }
      if (Object.keys(app.datatypes).length > 0) {
        for (let k in app.datatypes[app.category]) {
          const datatype = app.datatypes[app.category][k];
          if (datatype.input !== "file") {
            app.content[datatype.name] = content.data[datatype.name];
          } else {
            app.stored[datatype.name] = content.data[datatype.name];
          }
        }
      }
      app.loading = false;
    },
    async prepare() {
      const app = this;
      let isValid = true;
      for (let k in app.datatypes[app.category]) {
        const datatype = app.datatypes[app.category][k];
        if (datatype.required && (app.content[datatype.name] == null || app.content[datatype.name] == '')) {
          isValid = false;
        }
      }
      if (isValid && !app.isWorking) {
        app.isWorking = true;
        app.workingMessage = "Validating input data..";
        app.modals.working = true
        let metadata = {};
        for (let k in app.datatypes[app.category]) {
          const datatype = app.datatypes[app.category][k];
          if (datatype.input !== "file") {
            metadata[datatype.name] = app.content[datatype.name];
          } else {
            metadata[datatype.name] = []
            let files = []
            if (!app.stored[datatype.name].length) {
              files.push(app.stored[datatype.name])
            }
            else if (app.stored[datatype.name].length) {
              for (const fl of app.stored[datatype.name]) {
                files.push(fl)
              }
            }
            for (const file of files) {
              if (file.name !== undefined) {
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
                      app.modals.working = false
                      app.log("danger", "Upload on IPFS failed, please retry.");
                    }
                  } catch (e) {
                    app.isWorking = false;
                    app.modals.working = false
                    app.log("danger", "Upload on IPFS failed, please retry.");
                  }
                } else {
                  app.log(
                    "danger",
                    "Extension is not allowed, please retry with a different file."
                  );
                  app.isWorking = false;
                  app.modals.working = false
                }
              } else {
                metadata[datatype.name].push(file)
              }
            }
          }
        }
        //Uploading final metadata to IPFS
        metadata.name = (metadata.name) ? metadata.name : (metadata.title) ? metadata.title : 'MEGO CONTENT'
        metadata.description = (metadata.description) ? metadata.description :
          'This NFT represents a decentralised content on MEGO'
        metadata.image = (metadata.image) ? metadata.image : 'ipfs://bafkreiblyp34mtsvwk2tv4u7cwq6wdj5lkfgpmvkytvkzq4xlhwybebrhe'
        metadata.author = app.account;
        metadata.timestamp = new Date().getTime();
        metadata.category = app.category;
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
          app.modals.working = false
        } else {
          app.isWorking = false;
          app.modals.working = false
          app.log("danger", "Upload on IPFS failed, please retry.");
        }
      } else {
        app.log("danger", "Please fill all required fields.");
        app.isWorking = false;
        app.modals.working = false
      }
    },
    async mint() {
      const app = this;
      if (!app.isWorking) {
        app.isWorking = true;
        app.workingMessage = "Changing NFT, please continue with your wallet..";
        app.modals.working = true;
        const network = await app.web3.eth.net.getId();
        console.log("Found network:", network);
        if (network === app.network) {
          try {
            const factoryContract = new app.web3.eth.Contract(
              app.abi_factory,
              app.contract
            );
            await factoryContract.methods
              .fixContent(app.instance, app.tokenId, app.ipfsNft)
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
            app.modals.working = false
            setTimeout(function () {
              location.reload();
            }, 2000);
          } catch (e) {
            console.log("MINTING FAILED:", e);
            app.log("danger", "Minting failed, please retry..");
            app.isWorking = false;
            app.modals.working = false
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
    async freeze() {
      const app = this;
      if (!app.isWorking) {
        app.isWorking = true;
        app.workingMessage = "Freezing NFT, please continue with your wallet..";
        app.modals.working = true;
        const network = await app.web3.eth.net.getId();
        console.log("Found network:", network);
        if (network === app.network) {
          try {
            const factoryContract = new app.web3.eth.Contract(
              app.abi_factory,
              app.contract
            );
            await factoryContract.methods
              .freezeContent(app.instance, app.tokenId)
              .send({
                from: app.account,
                gas: 300000
              })
              .on("transactionHash", (tx) => {
                app.workingMessage = "Found pending transaction at: " + tx;
              });
            app.log(
              "success",
              "Freeze was successful, redirecting to public page.."
            );
            //app.isWorking = false;
            app.modals.working = false;
            setTimeout(function () {
              window.location.href = "/#/public";
            }, 2000);
          } catch (e) {
            console.log("MINTING FAILED:", e);
            app.log("danger", "Minting failed, please retry..");
            app.isWorking = false;
            app.modals.working = false;
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
    openTab(link) {
      window.open(link, '_blank')
    },
    copyText(type, text) {
      if (type === 'link') {
        text = location.href.split('#')[0] + '#' + text
        navigator.clipboard.writeText(text);
        setTimeout(() => { this.openTab(text) }, 1000)
      }
      else {
        navigator.clipboard.writeText(text);
      }
      this.log('success', type + ' copied!')
    },
    deleteImage(field, imageIndex) {
      const app = this
      let tempArr = app.stored[field]
      tempArr[imageIndex] = undefined
      app.stored[field] = []
      tempArr.forEach(el => {
        if (el) {
          app.stored[field].push(el)
        }
      })
    },
    showDeleteImageModal(event) {
      //Fixing parameters breaking the first list element's event
      this.modals.deleteImage = { name: event.target.getAttribute('inputname'), index: event.target.getAttribute('index') }
    }
  }
};
</script>
