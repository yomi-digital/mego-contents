<template>
  <div class="home">
    <div v-if="!loading">
      <div v-if="!ipfsNft">
        <b-field label="MODEL">
          <b-select v-model="category" expanded placeholder="Select a category">
            <option
              v-for="category in Object.keys(datatypes)"
              :value="category"
              :key="category"
            >
              {{ category.toUpperCase() }}
            </option>
          </b-select>
        </b-field>
        <div v-for="input in datatypes[category]" v-bind:key="input.name">
          <b-field
            v-if="input.input === 'text'"
            :label="input.name.toUpperCase()"
          >
            <b-input v-model="content[input.name]"></b-input>
          </b-field>
          <b-field
            v-if="input.input === 'textarea' && input.specs !== 'plain'"
            :label="input.name.toUpperCase()"
          >
            <VueEditor v-model="content[input.name]" />
          </b-field>
          <b-field
            v-if="input.input === 'textarea' && input.specs === 'plain'"
            :label="input.name.toUpperCase()"
          >
            <b-input v-model="content[input.name]" type="textarea"></b-input>
          </b-field>
          <b-field
            v-if="input.input === 'select'"
            v-bind:key="input.name"
            :label="input.name.toUpperCase()"
          >
            <b-select v-model="content[input.name]" expanded>
              <option
                v-for="category in input.specs
                  .replace('[', '')
                  .replace(']', '')
                  .split(',')"
                :value="category"
                :key="category"
              >
                {{ category }}
              </option>
            </b-select>
          </b-field>
          <b-field
            v-if="input.input === 'file'"
            v-bind:key="input.name"
            :label="input.name.toUpperCase()"
          >
            <b-upload v-model="content[input.name]" expanded drag-drop>
              <section class="section">
                <div class="content has-text-centered">
                  <p v-if="content[input.name].name === undefined">
                    Drop your file here or click to upload.<br />Supported
                    files: jpg, png, gif.
                  </p>
                  <p v-if="content[input.name].name !== undefined">
                    Chosen image is <b>{{ content[input.name].name }}</b
                    >.<br />Click or drop another file to change it.
                  </p>
                </div>
              </section>
            </b-upload>
          </b-field>
          <br />
        </div>
        <b-button v-if="!isWorking && !ipfsNft" expanded @click="prepare"
          >PREPARE METADATA</b-button
        >
      </div>
      <div v-if="ipfsNft" style="text-align: center; padding: 30vh 0">
        Metadata are generated, please double check them before mint at<br />
        <a
          target="_blank"
          :href="'https://ipfs.yomi.digital/ipfs/' + ipfsNft"
          >{{ ipfsNft }}</a
        ><br /><br />
        <b-button v-if="!isWorking" expanded @click="mint"
          >MINT CONTENT</b-button
        >
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
import { VueEditor } from "vue2-editor";
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
      contract: process.env.VUE_APP_FACTORY_CONTRACT,
      instance: "",
      network: parseInt(process.env.VUE_APP_CHAIN_ID),
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
    };
  },
  mounted() {
    const app = this;
    app.connect();
    setInterval(function () {
      app.$forceUpdate();
    }, 100);
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
            app.fetchModels();
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
      console.log("CONTENT", app.content);
      let isValid = true;
      for (let k in app.datatypes[app.category]) {
        const datatype = app.datatypes[app.category][k];
        if (datatype.required && app.content[datatype.name] === "") {
          isValid = false;
        }
      }
      if (isValid && !app.isWorking) {
        app.isWorking = true;
        app.workingMessage = "Validating input data..";
        let metadata = {};
        for (let k in app.datatypes[app.category]) {
          const datatype = app.datatypes[app.category][k];
          if (datatype.input !== "file") {
            metadata[datatype.name] = app.content[datatype.name];
          } else {
            const ext =
              app.content[datatype.name].name.split(".")[
                app.content[datatype.name].name.split(".").length - 1
              ];
            console.log("Extension file is:", ext);
            const supported = ["gif", "png", "jpg", "jpeg"];
            if (supported.indexOf(ext) !== -1) {
              app.log("success", "File is valid, uploading on IPFS..");
              const formData = new FormData();
              formData.append("file", app.content[datatype.name]);
              formData.append("name", app.content[datatype.name].name);
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
                  metadata[datatype.name] =
                    "ipfs://" + ipfsImageUpload.data.ipfs_hash;
                } else {
                  app.isWorking = false;
                  app.log("danger", "Upload on IPFS failed, please retry.");
                }
              } catch (e) {
                app.isWorking = false;
                app.log("danger", "Upload on IPFS failed, please retry.");
              }
            } else {
              app.log(
                "danger",
                "Extension is not allowed, please retry with a different file."
              );
              app.isWorking = false;
            }
          }
        }
        // Uploading final metadata to IPFS
        console.log("METADATA", metadata);
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
        } else {
          app.isWorking = false;
          app.log("danger", "Upload on IPFS failed, please retry.");
        }
      } else {
        app.log("danger", "Please fill all required fields.");
        app.isWorking = false;
      }
    },
    async mint() {
      const app = this;
      if (!app.isWorking) {
        app.isWorking = true;
        app.workingMessage = "Minting NFT, please continue with your wallet..";
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
              .send({ from: app.account, gas: 300000 })
              .on("transactionHash", (tx) => {
                app.workingMessage = "Found pending transaction at: " + tx;
              });
            app.log(
              "success",
              "Minting was successful, redirecting to draft page.."
            );
            app.isWorking = false;
            setTimeout(function () {
              window.location.href = "/#/drafts";
            }, 2000);
          } catch (e) {
            console.log("MINTING FAILED:", e);
            app.log("danger", "Minting failed, please retry..");
            app.isWorking = false;
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
