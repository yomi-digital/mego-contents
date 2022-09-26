<template>
  <div id="pricing">
    <div class="app_loading" v-if="!subscriptions[0]">
      <font-awesome-icon icon="fa-solid fa-circle-notch" style="font-size:20px;margin-top: .2rem;" class="fa-spin" />
    </div>
    <div class="modal_container" v-if="modals.working">
      <div class="modal">
        <img src="../assets/images/close-icon.svg" alt="Close" @click="modals.working = false">
        <h2 v-html="workingMessage"></h2>
        <!-- <p>Define the name and the ticker of the instance.</p> -->
        <font-awesome-icon icon="fa-solid fa-circle-notch" style="font-size:20px;margin-top: .2rem;" class="fa-spin"
          v-if="isWorking" />
      </div>
    </div>
    <div class="plans_container" v-if="loading">
      <div class="plan">
        <div class="loading_box" style="width:150px;height:35px;margin:auto"></div>
        <div class="loading_box mt-2" style="width:100px;height:25px;margin:auto;opacity:.8"></div>
        <div class="loading_box mt-2" style="width:150px;height:20px;margin:auto;opacity:.5"></div>
        <div class="loading_box mt-3" style="width:100%;height:10px;margin:auto"></div>
        <div class="loading_box mt-1" style="width:70%;height:10px;margin:auto;float:left"></div>
        <div class="loading_box mt-1 ml-1" style="width:25%;height:10px;margin:auto;float:left"></div>
        <div class="loading_box ml-0" style="width:40%;height:10px;margin-top: 18px;"></div>
        <ul>
          <li style="opacity:.6">
            <div class="loading_box mt-5" style="width:180px;height:15px;margin:auto"></div>
          </li>
          <li style="opacity:.6">
            <div class="loading_box mt-2" style="width:150px;height:15px;margin:auto"></div>
          </li>
        </ul>
        <div class="loading_box mt-5" style="width:150px;height:30px;margin:auto;filter: brightness(10);"></div>
      </div>
      <div class="plan">
        <div class="loading_box" style="width:150px;height:35px;margin:auto"></div>
        <div class="loading_box mt-2" style="width:100px;height:25px;margin:auto;opacity:.8"></div>
        <div class="loading_box mt-2" style="width:150px;height:20px;margin:auto;opacity:.5"></div>
        <div class="loading_box mt-3" style="width:100%;height:10px;margin:auto"></div>
        <div class="loading_box mt-1" style="width:70%;height:10px;margin:auto;float:left"></div>
        <div class="loading_box mt-1 ml-1" style="width:25%;height:10px;margin:auto;float:left"></div>
        <div class="loading_box ml-0" style="width:40%;height:10px;margin-top: 18px;"></div>
        <ul>
          <li style="opacity:.6">
            <div class="loading_box mt-5" style="width:180px;height:15px;margin:auto"></div>
          </li>
          <li style="opacity:.6">
            <div class="loading_box mt-2" style="width:150px;height:15px;margin:auto"></div>
          </li>
        </ul>
        <div class="loading_box mt-5" style="width:150px;height:30px;margin:auto;filter: brightness(10);"></div>
      </div>
      <div class="plan">
        <div class="loading_box" style="width:150px;height:35px;margin:auto"></div>
        <div class="loading_box mt-2" style="width:100px;height:25px;margin:auto;opacity:.8"></div>
        <div class="loading_box mt-2" style="width:150px;height:20px;margin:auto;opacity:.5"></div>
        <div class="loading_box mt-3" style="width:100%;height:10px;margin:auto"></div>
        <div class="loading_box mt-1" style="width:70%;height:10px;margin:auto;float:left"></div>
        <div class="loading_box mt-1 ml-1" style="width:25%;height:10px;margin:auto;float:left"></div>
        <div class="loading_box ml-0" style="width:40%;height:10px;margin-top: 18px;"></div>
        <ul>
          <li style="opacity:.6">
            <div class="loading_box mt-5" style="width:180px;height:15px;margin:auto"></div>
          </li>
          <li style="opacity:.6">
            <div class="loading_box mt-2" style="width:150px;height:15px;margin:auto"></div>
          </li>
        </ul>
        <div class="loading_box mt-5" style="width:150px;height:30px;margin:auto;filter: brightness(10);"></div>
      </div>
    </div>
    <div class="plans_container" v-if="!loading">
      <div class="plan">
        <h1>FREE</h1>
        <h2 v-html="web3.utils.fromWei(subscriptions[0].activation, 'ether')+' '+coin"></h2>
        <i>{{web3.utils.fromWei(subscriptions[0].monthly, 'ether')}} / month</i>
        <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit.</p>
        <ul>
          <li>Mint max {{free_limit}} times</li>
          <li>{{web3.utils.fromWei(subscriptions[0].deploy, 'ether')}} {{coin}} to deploy an instance</li>
        </ul>
        <b-button type="button" class="button-dark is-light mx-3 mt-5" v-if="subscriptionActive !== 0"
          style="background:#111!important;color:white!important" @click="chooseSubscription(0)">
          SELECT
        </b-button>
        <b-button type="button" class="button-light is-dark mx-3 mt-5 button_success" disabled
          style="opacity:.8!important" v-if="subscriptionActive === 0">
          ACTIVE
        </b-button>
      </div>
      <div class="plan" id="middle_plan">
        <h1>UNLIMITED</h1>
        <h2 v-html="web3.utils.fromWei(subscriptions[2].activation, 'ether')+' '+coin"></h2>
        <i>{{web3.utils.fromWei(subscriptions[2].monthly, 'ether')}} / month</i>
        <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolorem dolore corporis quod?</p>
        <ul>
          <li>Mint unlimited times</li>
          <li>{{web3.utils.fromWei(subscriptions[2].deploy, 'ether')}} {{coin}} to deploy an instance</li>
        </ul>
        <b-button type="button" class="button-dark is-light mx-3 mt-5" v-if="subscriptionActive !== 2"
          style="background:#111!important;color:white!important" @click="chooseSubscription(2)">
          {{subscriptions[2].already_bought ? 'SELECT' : 'UPGRADE'}}
        </b-button>
        <b-button type="button" class="button-light is-dark mx-3 mt-5 button_success" disabled
          style="opacity:.8!important" v-if="subscriptionActive === 2 && isSubscriptionActive">
          ACTIVE
        </b-button>
        <b-button type="button" class="button-light is-dark mx-3 mt-5"
          style="color:black!important;border:1px solid black!important"
          v-if="subscriptionActive === 2 && !isSubscriptionActive" @click="payMonthlyFee(2)">
          PAY MONTH
          <font-awesome-icon icon="fa-solid fa-circle-exclamation"
            style="font-size:15px;color: #ff850f;margin:0 0 .1rem .1rem;" />
        </b-button>
      </div>
      <div class="plan" id="right_plan">
        <h1>PREMIUM</h1>
        <h2 v-html="web3.utils.fromWei(subscriptions[1].activation, 'ether')+' '+coin"></h2>
        <i>{{web3.utils.fromWei(subscriptions[1].monthly, 'ether')}} / month</i>
        <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolorem dolore corporis quod?</p>
        <ul>
          <li>Mint unlimited times</li>
          <li>{{web3.utils.fromWei(subscriptions[1].deploy, 'ether')}} {{coin}} to deploy an instance</li>
        </ul>
        <b-button type="button" class="button-dark is-light mx-3 mt-5" v-if="subscriptionActive !== 1"
          style="background:#111!important;color:white!important" @click="chooseSubscription(1)">
          {{subscriptions[1].already_bought ? 'SELECT' : (subscriptionActive===0) ? 'UPGRADE' : 'SELECT'}}
        </b-button>
        <b-button type="button" class="button-light is-dark mx-3 mt-5 button_success" disabled
          style="opacity:.8!important" v-if="subscriptionActive === 1 && isSubscriptionActive">
          ACTIVE
        </b-button>
        <b-button type="button" class="button-light is-dark mx-3 mt-5"
          style="color:black!important;border:1px solid black!important"
          v-if="subscriptionActive === 1 && !isSubscriptionActive" @click="payMonthlyFee(1)">
          PAY MONTH
          <font-awesome-icon icon="fa-solid fa-circle-exclamation"
            style="font-size:15px;color: #ff850f;margin:0 0 .1rem .1rem;" />
        </b-button>
      </div>
    </div>
    <div class="loading_box" style="width:350px;height:20px;margin:6rem auto auto auto;opacity:.5" v-if="loading"></div>
    <p v-if="subscriptionActive === 0 && !loading" class="free_mints">You have {{free_limit-free_mints}} free mints left
      <font-awesome-icon v-if="free_limit-free_mints === 0" icon="fa-solid fa-circle-exclamation"
        style="font-size:15px;color: #ff850f;margin:0 0 .1rem .3rem;" />
      <br /><i>({{free_mints}} used)</i>
    </p>
    <p v-if="(subscriptionActive === 1 || subscriptionActive === 2) && !loading && isSubscriptionActive" class="free_mints">
      Next payment: <i>{{web3.utils.fromWei(subscriptions[subscriptionActive].monthly, 'ether')}}</i> {{coin}} on the
      <strong>{{new Date(new Date(new Date().setDate(new Date(registration_timestamp).getDate())).setMonth(new Date().getMonth()+1)).toLocaleString()}}</strong>
    </p>
    <p v-if="(subscriptionActive === 1 || subscriptionActive === 2) && !loading && !isSubscriptionActive" class="free_mints">
      Missing payment: <i>{{web3.utils.fromWei(subscriptions[subscriptionActive].monthly, 'ether')}}</i> {{coin}} on the
      <strong>{{new Date(new Date(new Date().setDate(new Date(registration_timestamp).getDate())).setMonth(new Date().getMonth()-1)).toLocaleString()}}</strong>
    </p>
    <p v-if="(subscriptionActive === 1 || subscriptionActive === 2) && !loading" class="subscription_status mt-3">
      Subscription status: <span
        :style="(isSubscriptionActive) ? 'background:#71ff9e' : 'background:#ffdab7'">{{(isSubscriptionActive) ?
        'ACTIVE' : 'SUSPENDED'}}</span>
    </p>
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
  name: 'Pricing',
  data() {
    return {
      coin: process.env.VUE_APP_COIN,
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
      subscriptions: [], //subscriptions prices
      subscriptionActive: -1,
      isSubscriptionActive: false,
      loading: true,
      free_mints: 0,
      epoch: '',
      free_limit: 0,
      registration_timestamp: '',
      modals: {
        working: false
      }
    }
  },
  async mounted() {
    let count = 0
    let intervalTemp = setInterval(() => {
      try {
        count++
        document.getElementById('app').style.background = '#EDEDED'
        document.getElementById('navbar_group').children[1].style.background = '#EDEDED'
        document.getElementById('right_plan').addEventListener('mouseover', () => {
          document.getElementById('middle_plan').setAttribute('style', 'transform:scale(1)!important')
        })
        document.getElementById('right_plan').addEventListener('mouseout', () => {
          document.getElementById('middle_plan').removeAttribute('style')
        })
        clearInterval(intervalTemp)
        count = undefined
      }
      catch {
        if (count > 100) { clearInterval(intervalTemp); count = undefined }
      }
    }, 100)
    await this.connect()
    this.loading = false
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
              infuraId: app.infuraId
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
            await app.fetchSubscriptions()
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
    async fetchSubscriptions() {
      const app = this
      const factoryContract = new app.web3.eth.Contract(
        app.abi_factory,
        app.factory_contract
      );
      try {
        let i = 0
        let ended = false
        while (!ended) {
          const activationPrice = await factoryContract.methods.subscription_prices(i).call()
          const monthly = await factoryContract.methods.monthly_prices(i).call()
          const deploy = await factoryContract.methods.deployment_prices(i).call()
          const already_bought = await factoryContract.methods.plans_bought(app.account, i).call()
          if (activationPrice === '0' && i > 1) {
            ended = true
          }
          else {
            app.subscriptions.push({
              id: i,
              activation: activationPrice,
              monthly: monthly,
              deploy: deploy,
              already_bought: already_bought
            })
          }
          i++
        }
        if (app.subscriptionActive === 0)
          app.free_mints = await factoryContract.methods.free_mints(app.account).call()
        app.subscriptionActive = parseInt(await factoryContract.methods.subscriptions(app.account).call())
        app.isSubscriptionActive = await factoryContract.methods.isSubscriptionActive(app.account).call()
        app.free_limit = await factoryContract.methods.free_limit().call()
        app.epoch = await factoryContract.methods.getEpoch(app.account).call()
        app.registration_timestamp = Number(await factoryContract.methods.registration_timestamps(app.account).call()) * 1000
      }
      catch (e) {
        console.log(e)
      }
    },
    async chooseSubscription(subscription) {
      const app = this
      app.isWorking = true
      app.workingMessage = 'Please, confirm the transaction on your wallet'
      app.modals.working = true
      const factoryContract = new app.web3.eth.Contract(
        app.abi_factory,
        app.factory_contract
      );
      try {
        let actualValue = (app.subscriptions[subscription].already_bought) ? 0 : app.subscriptions[subscription].activation 
        await factoryContract.methods.chooseSubscription(subscription).send({ from: app.account, value: actualValue }).on("transactionHash", tx => {
          app.workingMessage = "Buying subscription <br />Waiting for confirmations at " + tx;
          app.$forceUpdate()
        });
        location.reload()
      }
      catch {
        app.isWorking = false
        app.modals.working = false
      }
    },
    async payMonthlyFee(subscription) {
      const app = this
      app.isWorking = true
      app.workingMessage = 'Please, confirm the transaction on your wallet'
      app.modals.working = true
      const factoryContract = new app.web3.eth.Contract(
        app.abi_factory,
        app.factory_contract
      );
      try {
          await factoryContract.methods.payMonthlyFee().send({ from: app.account, value: app.subscriptions[subscription].monthly }).on("transactionHash", tx => {
          app.workingMessage = "Paying subscription <br />Waiting for confirmations at " + tx;
          app.$forceUpdate()
        });
        location.reload()
      }
      catch {
        app.isWorking = false
        app.modals.working = false
      }
    }
  }
}
</script>