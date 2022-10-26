<template>
  <div id="instances">
    <div class="modal_container" v-if="modals.info">
      <div class="modal">
        <img src="../assets/images/close-icon.svg" alt="Close" @click="modals.info = false">
        <p class="mt-5" style="text-align: center;font-size: 18px;">In order to create contents you must create an new
          contract (instance) where your
          contents will be stored. This contract will be owned by you of course and
          you'll be able to see it on OpenSea.<br />Each new deploy will costs you
          {{web3.utils.fromWei(deployment_price, 'ether')+' '+coin}} with your current {{subscriptionActive===0 ? 'Free'
          : (subscriptionActive===1) ? 'Premium' : (subscriptionActive===2) ? 'Unlimited' : ''}} plan.</p>
        <b-button type="button" class="button-dark is-light mx-3 mt-5"
          style="background:#111!important;color:white!important" @click="$router.push({name: 'Pricing'})">
          MANAGE PLAN
        </b-button>
      </div>
    </div>
    <div class="instances_loading" v-if="loading && Object.keys(datatypes).length === 0">
      <font-awesome-icon icon="fa-solid fa-circle-notch" style="font-size:25px" class="fa-spin" />
    </div>
    <div class="modal_container" v-if="modals.createInstance">
      <div class="modal">
        <img src="../assets/images/close-icon.svg" alt="Close" id="close_createIntanceModal"
          @click="modals.createInstance = false">
        <h2>Create new instance</h2>
        <p>Define the name and the ticker of the instance.</p>
        <b-input type="text" class="mt-5 instance_name" placeholder="New instance name" v-model="newInstanceName">
        </b-input>
        <b-input type="text" class="mt-4 instance_ticker" placeholder="New instance ticker" v-model="newInstanceTicker">
        </b-input>
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
        <h2 class="has-text-weight-semibold" style="position:relative">AVAILABLE INSTANCES
          <font-awesome-icon icon="fa-solid fa-circle-info" class="instances_info_icon" @click="modals.info = true" />
          <!-- <b-button type="button" class="button-dark is-light mr-0 ml-4"
            style="background:#111!important;color:white!important">
            <font-awesome-icon icon="fa-solid fa-plus" style="font-size:24px" />
          </b-button> -->
        </h2>
        <b-button type="button button-dark is-light ml-auto mr-0 mt-1"
          style="background:#111!important;color:white!important" class="button create_instance_btn"
          @click="modals.createInstance = true" v-if="canMint">
          CREATE NEW INSTANCE
        </b-button>
        <b-button type="button button-dark is-light ml-auto mr-0 mt-1"
          style="background:#111!important;color:white!important" class="button create_instance_btn" v-if="!canMint">
          CREATE NEW INSTANCE
          <font-awesome-icon icon="fa-solid fa-circle-exclamation"
            style="font-size:15px;color: #ff850f; margin-left:.2rem;" />
        </b-button>
      </div>
      <div class="no_instances is-size-5" v-if="instances.length === 0 && !loading">
        You have no instance at the moment
      </div>
      <div class="instances_list" v-if="Object.keys(datatypes).length > 0">
        <div class="instance" v-for="instance in Object.keys(datatypes)" :key="instance">
          <div class="instance_left">
            <h3 class="my-2"><span style="font-weight:bold;color:black;font-size:22px;">{{names[instance]}}</span><i
                style="font-size:15px; margin:0 1rem">Deployed at: <a :href="explorer_url+'/address/'+instance"
                  target="_blank" style="color:black;text-decoration:underline">{{Object.entries(names).find(el => el[0]
                  === instance)[0]}}</a></i>
              <i style="font-size:15px; margin:0 1rem" v-if="owners[instance] !== account">Owned by: <a
                  :href="explorer_url+'/address/'+owners[instance]" target="_blank"
                  style="color:black;text-decoration:underline">{{owners[instance]}}</a></i>
            </h3>
            <p v-for="datatype in Object.keys(datatypes[instance])" :key="datatype"
              v-html="(datatype.indexOf('__') > 0) ? datatype.slice(datatype.indexOf('__')+2, 99999) : datatype"></p>
            <p v-if="Object.keys(datatypes[instance]).length === 0"><i style="color:#444">No datatypes</i></p>
          </div>
          <div class="instance_right">
            <b-button type="button" class="button button-dark is-light mx-auto mt-0 manage_instance_btn"
              @click="changeInstance(instance)">
              MANAGE INSTANCE</b-button>
          </div>
        </div>
      </div>
      <div class="instances_list" v-if="loading">
        <div class="instance" v-for="i in 3-Object.keys(datatypes).length" :key="i">
          <div class="instance_left">
            <h3 class="my-2">
              <div class="loading_box"
                style="width:100px;height:20px;display: inline-block;filter: drop-shadow(0 0 0 black);"></div><i
                style="font-size:15px; margin:0 1rem">Deployed at: <div class="loading_box"
                  style="width:150px;height: 15px;display: inline-block; margin-left: 4px;"></div></i>
            </h3>
            <div class="loading_box mt-1" style="width:100px;height: 14px; opacity: .35;"></div>
            <div class="loading_box mt-3" style="width:100px;height: 14px; opacity: .35;"></div>
            <div class="loading_box mt-3" style="width:100px;height: 14px; opacity: .35;"></div>
          </div>
          <div class="instance_right">
            <div class="loading_box" style="width:180px;height: 38px;"></div>
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
  name: 'Instances',
  data() {
    return {
      coin: '',
      infuraId: process.env.VUE_APP_INFURA_ID,
      umiUrl: process.env.VUE_APP_UMI_API,
      axios: axios,
      abi_factory: abi_factory,
      abi_contents: abi_contents,
      contract: '',
      explorer_url: '',
      network: '',
      web3: {},
      account: "",
      content: {},
      instances: [],
      datatypes: {},
      names: [],
      loading: true,
      modals: {
        createInstance: false,
        info: false
      },
      newInstanceName: '',
      newInstanceTicker: '',
      isWorking: false,
      subscriptionActive: -1,
      deployment_price: '',
      canMint: true,
      owners: {}
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
            app.subscriptionActive = parseInt(await factoryContract.methods.subscriptions(app.account).call())
            app.deployment_price = await factoryContract.methods.deployment_prices(app.subscriptionActive).call()
            app.instances = await factoryContract.methods
              .instancesOfOwner(app.account)
              .call();
            for (let k in app.instances) {
              const contentsContract = new app.web3.eth.Contract(
                app.abi_contents,
                app.instances[k]
              );
              const name = await contentsContract.methods.name().call();
              app.owners[app.instances[k]] = await contentsContract.methods.owner().call();
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
            }
            i++;
          } catch {
            exists = false;
          }
        }
        response(true);
      });
    },
    async deployContract() {
      const app = this;
      if (app.newInstanceName && app.newInstanceTicker) {
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
            const newInstance = await nftContract.methods
              .startNewInstance(app.newInstanceName, app.newInstanceTicker)
              .send({
                from: app.account,
                value: app.deployment_price,
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
      else {
        app.log('danger', 'Please, fill in the name field')
      }
    },
    changeInstance(instance) {
      localStorage.setItem('instance', instance)
      this.$router.push({
        name: 'Instance',
        params: {
          instance: instance
        }
      })
    },
    log(type, content) {
      this.$buefy.snackbar.open({
        type: "is-" + type,
        message: content,
        pauseOnHover: true,
      });
    }
  },
  async mounted() {
    document.getElementById('app').style.background = '#EDEDED'
    document.getElementById('navbar_group').children[1].style.background = '#EDEDED'
    const app = this;
    let chain = localStorage.getItem('chain')
    let chains = localStorage.getItem('chains')
    if (chain && chains) {
      chains = JSON.parse(chains)
      app.explorer_url = chains[chain].explorer
      app.contract = chains[chain].contract
      app.network = chains[chain].network
      app.coin = chains[chain].coin
    }
    await app.connect();
    // if (localStorage.getItem('instancesInfoModal') == null) {
    //   localStorage.setItem('instancesInfoModal', 1)
    //   app.modals.info = true
    // }
    let mintCheckInterval = setInterval(() => {
      //checking if can mint
      if (localStorage.getItem('canMint') != null && JSON.parse(localStorage.getItem('canMint')) === false && app.canMint) {
        app.canMint = false
        clearInterval(mintCheckInterval)
      }
    }, 500)
  }
}
</script>