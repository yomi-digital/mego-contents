<template>
  <div id="users">
    <div class="modal_container" v-if="modals.add_user">
      <div class="modal">
        <img src="../assets/images/close-icon.svg" alt="Close" id="close_createIntanceModal"
          @click="modals.add_user = false">
        <h2>Add new collaborator</h2>
        <p>Insert user address you want to add to your instance</p>
        <b-input type="text" class="mt-5 instance_name" placeholder="0x" v-model="newUser">
        </b-input>
        <b-button type="button button-dark is-light mt-5" style="background:#111!important;color:white!important"
          class="button" @click="updateUser(newUser, true)" v-if="!isWorking">
          ADD USER
        </b-button>
        <b-button type="button button-dark is-light mt-5" style="background:#111!important;color:white!important"
          class="button" v-if="isWorking">
          <font-awesome-icon icon="fa-solid fa-circle-notch" style="font-size:20px;margin-top: .2rem;"
            class="fa-spin" />
        </b-button>
      </div>
    </div>
    <div class="modal_container" v-if="modals.subscription_error">
      <div class="modal">
        <img src="../assets/images/close-icon.svg" alt="Close" id="close_createIntanceModal"
          @click="modals.subscription_error = false">
        <font-awesome-icon icon="fa-solid fa-circle-exclamation"
          style="font-size:30px;color: #ff850f;margin:0 0 .5rem 0" />
        <h2>Premium subscription or higher required</h2>
        <p>Instance user management is not included in your Free plan </p>
        <p>Take a look at our plan pricing</p>
        <b-button type="button" class="button-dark is-light mx-3 mt-5"
          style="background:#111!important;color:white!important" @click="$router.push({name: 'Pricing'})">
          MANAGE PLAN
        </b-button>
      </div>
    </div>
    <div class="modal_container" v-if="modals.remove_user">
      <div class="modal">
        <img src="../assets/images/close-icon.svg" alt="Close" @click="modals.remove_user = ''">
        <h2>Are you sure you want to remove <i>{{modals.remove_user}}</i> from your instance collaborators?</h2>
        <!-- <p>Define the name and the ticker of the instance.</p> -->
        <div style="display:flex">
          <b-button type="button" class="button-light is-dark mx-3 mt-5" v-if="!isWorking"
            style="color:black!important;border:1px solid black!important" @click="modals.remove_user = ''">
            NO
          </b-button>
          <b-button type="button" class="button-dark is-light mx-3 mt-5" v-if="!isWorking"
            style="background:#111!important;color:white!important" @click="updateUser(modals.remove_user, false)">
            YES
          </b-button>
          <b-button type="button" class="button-light is-dark mx-3 mt-5"
            style="color:black!important;border:1px solid black!important" v-if="isWorking">
            <font-awesome-icon icon="fa-solid fa-circle-notch" style="font-size:20px" class="fa-spin" />
          </b-button>
          <b-button type="button" class="button-dark is-light mx-3 mt-5"
            style="background:#111!important;color:white!important" v-if="isWorking">
            <font-awesome-icon icon="fa-solid fa-circle-notch" style="font-size:20px" class="fa-spin" />
          </b-button>
        </div>
      </div>
    </div>
    <div class="instances_container">
      <div class="instance_info">
        <h2>Instance collaborators</h2>
      </div>
      <div class="instances_header">
        <h2 class="has-text-weight-semibold">
          <div class="users_searcher">
            <b-input type="text" v-model="searcher" placeholder="search collaborator"></b-input>
            <font-awesome-icon icon="fa-solid fa-magnifying-glass"></font-awesome-icon>
          </div>
        </h2>
        <div style="display:flex;margin-right:0;margin-left:auto" v-if="account === owner">
          <b-button type="button" class="button-dark is-light mx-3" v-if="subscription !== 0"
            style="background:#111!important;color:white!important" @click="modals.add_user = true">
            ADD COLLABORATOR
          </b-button>
          <b-button type="button" class="button-dark is-light mx-3" v-if="subscription === 0"
            style="background:#111!important;color:white!important" @click="modals.subscription_error = true">
            ADD COLLABORATOR<font-awesome-icon icon="fa-solid fa-circle-exclamation" style="margin-left:.5rem">
            </font-awesome-icon>
          </b-button>
        </div>
        <div style="display:flex;margin-right:0;margin-left:auto" v-if="account !== owner">
          <p>You are a collaborator of this instance</p>
        </div>
      </div>
      <div class="no_instances is-size-5" v-if="!loading && users.length === 0 && !searcher">
        You have no collaborators in this instance
      </div>
      <div class="no_instances is-size-5" v-if="!loading && users.length === 0 && searcher">
        No collaborators found for <b>{{searcher}}</b>
      </div>
      <div class="instances_list mt-5" v-if="users.length > 0">
        <div class="instance" v-for="user in users" :key="user.address">
          <div class="instance_left">
            <h3 style="text-transform: unset!important;" class="my-2">{{user.address}} <i v-if="user.address===account"
                class="ml-5">( you )</i></h3>
          </div>
          <div class="instance_right" v-if="owner === account">
            <b-button type="button" class="button button-dark is-light mx-auto mt-0"
              style="margin: 0 .5rem!important; width: 50px;" @click="modals.remove_user = user.address"><img
                src="../assets/images/trash-icon.svg" alt="" style="transform:translateY(2px)">
            </b-button>
          </div>
        </div>
      </div>
      <div class="instances_list mt-5" v-if="loading">
        <div class="instance" v-for="i in 3" :key="i">
          <div class="instance_left">
            <h3 class="my-2">
              <div class="loading_box"
                style="width:100px;height:20px;display: inline-block;filter: drop-shadow(0 0 0 black);"></div>
            </h3>
            <!-- <div class="loading_box mt-1" style="width:100px;height: 14px; filter: contrast(0.1); opacity: .35;">
            </div>
            <div class="loading_box mt-3" style="width:100px;height: 14px; filter: contrast(0.1); opacity: .35;">
            </div>
            <div class="loading_box mt-3" style="width:100px;height: 14px; filter: contrast(0.1); opacity: .35;">
            </div> -->
          </div>
          <div class="instance_right">
            <div class="loading_box" style="margin: 0 .5rem!important; width: 50px;height: 40px;"></div>
            <div class="loading_box" style="margin: 0 .5rem!important; width: 50px;height: 40px;"></div>
          </div>
        </div>
        <div class="loading_box" style="width:100%"></div>
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
  name: "Drafts",
  data() {
    return {
      infuraId: process.env.VUE_APP_INFURA_ID,
      umiUrl: process.env.VUE_APP_UMI_API,
      axios: axios,
      abi_factory: abi_factory,
      abi_contents: abi_contents,
      contents_api: process.env.VUE_APP_CONTENTS_API,
      contract: '',
      instance: "",
      network: '',
      web3: {},
      account: "",
      users: [],
      originalUsers: [],
      loading: true,
      searcher: '',
      modals: {
        add_user: false,
        subscription_error: false,
        remove_user: ''
      },
      newUser: '',
      isWorking: false,
      subscription: -1,
      canMint: true,
      owner: ''
    };
  },
  watch: {
    searcher: {
      handler() {
        this.users = this.originalUsers.filter(el => {
          let address = el.address
          return (address.indexOf(this.searcher) !== -1)
        })
      }
    }
  },
  async mounted() {
    const app = this
    let chain = localStorage.getItem('chain')
    let chains = localStorage.getItem('chains')
    if (chain && chains) {
      chains = JSON.parse(chains)
      app.contract = chains[chain].contract
      app.network = chains[chain].network
    }
    document.getElementById('app').style.background = '#EDEDED'
    document.getElementById('navbar_group').children[1].style.background = '#EDEDED'
    await app.connect();
    await app.fetchUsers()
    app.loading = false
    app.subscription = Number(localStorage.getItem('subscription'))
    let mintCheckInterval = setInterval(() => {
      //checking if can add user
      if (localStorage.getItem('canMint') != null && JSON.parse(localStorage.getItem('canMint')) === false && app.canMint) {
        app.canMint = false
        app.$forceUpdate()
        clearInterval(mintCheckInterval)
      }
    }, 500)
    app.$forceUpdate()
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
            const contentsContract = new app.web3.eth.Contract(
              app.abi_contents,
              app.instance
            );
            app.owner = await contentsContract.methods.owner().call()
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
    async fetchUsers() {
      const app = this
      try {
        const users = await app.axios(app.contents_api + '/users/' + app.instance).then(res => res.data)
        this.users = users
        this.originalUsers = this.users
      }
      catch {
        app.log("danger", "error while retrieving instance users!")
      }
    },
    async updateUser(user, state) {
      const app = this
      if (!app.isWorking && app.subscription !== 0) {
        if (user && user.indexOf('0x') !== -1) {
          //Exists yet check
          let exists = (app.users.find(el => el.address === user) != undefined)
          if (exists && state) {
            app.log('danger', 'That address is already in your collaborators')
          }
          else if (!exists && !state) {
            app.log('danger', 'That address is not in your collaborators')
          }
          else {
            app.isWorking = true
            const factoryContract = new app.web3.eth.Contract(
              app.abi_factory,
              app.contract
            );
            try {
              await factoryContract.methods.manageInstanceUsers(app.instance, user, state).send({ from: app.account })
              setTimeout(() => {
                location.reload()
              }, 2000)
            }
            catch {
              app.log('danger', 'An error occurred during instance user update')
              app.isWorking = false
            }
          }
        }
        else {
          app.log('danger', 'Please, insert a valid address')
          app.isWorking = false
        }
        if (!state) {
          app.modals.remove_user = ''
        }
      }
    }
  }
};
</script>
