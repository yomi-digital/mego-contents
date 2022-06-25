<template>
  <div class="home">
    <div v-if="!loading" style="position: relative">
      <b-button
        @click="send('owner')"
        v-if="!owner && canManage"
        style="position: absolute; top: -15px; right: 0; font-size: 12px"
        >SEND FOR APPROVAL -></b-button
      >
      <b-button
        @click="send('live')"
        v-if="owner && canManage"
        style="position: absolute; top: -15px; right: 0; font-size: 12px"
        >SEND LIVE -></b-button
      >
      <b-button
        @click="send('author')"
        v-if="owner && canManage"
        style="position: absolute; top: -15px; right: 120px; font-size: 12px"
        >REJECT -></b-button
      >
      <div
        v-if="author"
        style="
          margin-top: -10px;
          float: left;
          padding-bottom: 20px;
          width: 100%;
          display: block;
        "
      >
        Created by: {{ author }}
      </div>
      <b-field label="Title">
        <b-input v-model="title"></b-input>
      </b-field>
      <b-field label="Summary">
        <b-input
          v-model="summary"
          placeholder="Write the summary for the content, max 150 characters."
        ></b-input>
      </b-field>
      <b-field label="Category">
        <b-select v-model="category" expanded placeholder="Select a category">
          <option
            v-for="category in categories"
            :value="category"
            :key="category"
          >
            {{ category }}
          </option>
        </b-select>
      </b-field>
      <b-field label="Content">
        <VueEditor v-model="content" />
      </b-field>
      <div v-if="previousImage">
        <img
          :src="
            previousImage.replace(
              'ipfs://',
              'https://ipfs.yomi.digital/ipfs/'
            )
          "
          width="100%"
        />
      </div>
      <b-field v-if="!owner" label="Image">
        <b-upload v-model="image" expanded drag-drop>
          <section class="section">
            <div class="content has-text-centered">
              <p v-if="!image.name">
                Drop your file here or click to upload.<br />Supported files:
                jpg, png, gif.
              </p>
              <p v-if="image.name">
                Chosen image is <b>{{ image.name }}</b
                >.<br />Click or drop another file to change it.
              </p>
            </div>
          </section>
        </b-upload>
      </b-field>
      <b-button
        v-if="!isWorking && !ipfsNft && canManage"
        expanded
        @click="prepare"
        >PREPARE METADATA</b-button
      >
      <div v-if="ipfsNft" style="text-align: center; padding: 20px 0 20px 0">
        Metadata are generated, please double check them before fix at<br />
        <a
          target="_blank"
          :href="'https://ipfs.yomi.digital/ipfs/' + ipfsNft"
          >{{ ipfsNft }}</a
        ><br /><br />
        <b-button v-if="!isWorking" expanded @click="fix">CHANGE NFT</b-button>
      </div>
      <div v-if="isWorking" style="padding: 20px 0; text-align: center">
        {{ workingMessage }}
      </div>
    </div>
    <div v-if="loading">
      Loading informations from blockchain, please wait..
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
const abi = require("../abi.json");
const FormData = require("form-data");

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
      abi: abi,
      contract: process.env.VUE_APP_UMI_CONTRACT,
      contentOwner: process.env.VUE_APP_CONTENT_OWNER,
      network: parseInt(process.env.VUE_APP_CHAIN_ID),
      web3: {},
      account: "",
      author: "",
      content: "",
      title: "",
      image: {},
      ipfsFile: "",
      summary: "",
      category: "blog",
      categories: ["blog", "ama"],
      isWorking: false,
      workingMessage: "",
      ipfsNft: "",
      loading: true,
      previousImage: "",
      tokenId: 0,
      owner: false,
      canManage: true
    };
  },
  mounted() {
    this.tokenId = this.$route.params.tokenId;
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
            const nftContract = new web3.eth.Contract(app.abi, app.contract);
            const contractOwner = await nftContract.methods.owner().call();
            if (app.account === contractOwner) {
              app.owner = true;
            }
            const owner = await nftContract.methods.ownerOf(app.tokenId).call();
            if (owner !== app.account) {
              app.canManage = false;
              app.log("danger", "Not the owner, can't manage.");
            }
            console.log("Owner matches, downloading from IPFS.");
            let tokenURI = await nftContract.methods
              .tokenURI(app.tokenId)
              .call();
            console.log("TOKEN URI IS:", tokenURI);
            const content = await app.axios.get(
              tokenURI.replace(
                "ipfs://",
                "https://ipfs.yomi.digital/ipfs/"
              )
            );
            console.log(content.data);
            app.title = content.data.name;
            app.summary = content.data.summary;
            app.category = content.data.category;
            app.content = content.data.html;
            app.previousImage = content.data.image;
            app.author = content.data.author;
            app.loading = false;
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
    readFile(file) {
      return new Promise((response) => {
        var reader = new FileReader();
        reader.onload = function (event) {
          var readed = event.target.result;
          response(readed);
        };
        reader.readAsArrayBuffer(file);
      });
    },
    async prepare() {
      const app = this;
      if (
        app.title.length > 0 &&
        app.summary.length > 0 &&
        app.summary.length <= 150 &&
        app.category.length > 0 &&
        app.content.length > 0 &&
        !app.isWorking
      ) {
        app.isWorking = true;
        app.workingMessage = "Validating input data..";
        if (app.image.name !== undefined) {
          const ext =
            app.image.name.split(".")[app.image.name.split(".").length - 1];
          console.log("Extension file is:", ext);
          const supported = ["gif", "png", "jpg", "jpeg"];
          if (supported.indexOf(ext) !== -1) {
            app.log("success", "File is valid, uploading on IPFS..");
            const formData = new FormData();
            formData.append("file", app.image);
            formData.append("name", app.image.name);
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
                app.ipfsFile = ipfsImageUpload.data.ipfs_hash;
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
        } else {
          app.ipfsFile = app.previousImage;
        }

        app.workingMessage = "Creating final NFT metadata..";
        let ipfNftUpload = await axios({
          method: "post",
          url: app.umiUrl + "/ipfs/nft",
          data: {
            provider: "pinata",
            nft: {
              name: app.title,
              description:
                "MEGO decentralized content, created by " +
                app.account +
                ".",
              image: "ipfs://" + app.ipfsFile,
              html: app.content,
              category: app.category,
              summary: app.summary,
              author: app.account,
              timestamp: new Date().getTime(),
            },
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
    async fix() {
      const app = this;
      if (!app.isWorking) {
        app.isWorking = true;
        app.workingMessage = "Changing NFT, please continue with your wallet..";
        const network = await app.web3.eth.net.getId();
        console.log("Found network:", network);
        if (network === app.network) {
          try {
            const nftContract = new app.web3.eth.Contract(
              app.abi,
              app.contract
            );
            await nftContract.methods
              .fixNFT(app.tokenId, app.ipfsNft)
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
    async send(receiver) {
      const app = this;
      if (!app.isWorking) {
        app.isWorking = true;
        app.workingMessage =
          "Sending NFT for validation, please continue with your wallet..";
        const network = await app.web3.eth.net.getId();
        console.log("Found network:", network);
        if (network === app.network) {
          try {
            const nftContract = new app.web3.eth.Contract(
              app.abi,
              app.contract
            );
            let finalAddress;
            if (receiver === "live") {
              finalAddress = app.contentOwner;
            } else if (receiver === "author") {
              finalAddress = app.author;
            } else if (receiver === "owner") {
              const contractOwner = await nftContract.methods.owner().call();
              finalAddress = contractOwner;
            }
            await nftContract.methods
              .safeTransferFrom(app.account, finalAddress, app.tokenId)
              .send({ from: app.account, gas: 300000 })
              .on("transactionHash", (tx) => {
                app.workingMessage = "Found pending transaction at: " + tx;
              });
            app.log("success", "Sending was successful, refreshing..");
            app.isWorking = false;
            setTimeout(function () {
              location.reload();
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
