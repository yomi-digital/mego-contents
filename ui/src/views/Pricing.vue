<template>
  <div id="pricing">
    <div class="app_loading" v-if="loading">
      <font-awesome-icon icon="fa-solid fa-circle-notch" style="font-size:20px;margin-top: .2rem;" class="fa-spin" />
    </div>
    <div class="plans_container">
      <div class="plan">
        <h1>FREE</h1>
        <h2>0.0 ether</h2>
        <i>0.0 / month</i>
        <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit.</p>
        <ul>
          <li>Mint max 5 times</li>
          <li>0.2 ether to deploy an instance</li>
        </ul>
        <b-button type="button" class="button-dark is-light mx-3 mt-5" v-if="subscriptionActive !== 0"
          style="background:#111!important;color:white!important" @click="buySubscription(0)">
          SELECT
        </b-button>
        <b-button type="button" class="button-light is-dark mx-3 mt-5" v-if="subscriptionActive === 0"
          style="color:black!important;border:1px solid black!important;opacity:.5">
          ACTIVE
        </b-button>
      </div>
      <div class="plan">
        <h1>UNLIMITED</h1>
        <h2>0.3 ether</h2>
        <i>0.01 / month</i>
        <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolorem dolore corporis quod?</p>
        <ul>
          <li>Mint unlimited times</li>
          <li>0.05 ether to deploy an instance</li>
        </ul>
        <b-button type="button" class="button-dark is-light mx-3 mt-5"
          style="background:#111!important;color:white!important" @click="buySubscription(2)">
          {{subscriptionActive===0 ? 'UPGRADE' : 'SELECT'}}
        </b-button>
      </div>
      <div class="plan">
        <h1>PREMIUM</h1>
        <h2>0.15 ether</h2>
        <i>0.025 / month</i>
        <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolorem dolore corporis quod?</p>
        <ul>
          <li>Mint unlimited times</li>
          <li>0.15 ether to deploy an instance</li>
        </ul>
        <b-button type="button" class="button-dark is-light mx-3 mt-5"
          style="background:#111!important;color:white!important" @click="buySubscription(1)">
          {{subscriptionActive===0 ? 'UPGRADE' : 'SELECT'}}
        </b-button>
      </div>
    </div>
    <p v-if="subscriptionActive === 0" class="free_mints">You have {{5-free_mints}} free mints left <br /><i>({{free_mints}} used)</i></p>
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
      subscriptions: [],
      subscriptionActive: -1,
      loading: true,
      free_mints: 0,
      epoch: ''
    }
  },
  async mounted() {
    document.getElementById('app').style.background = '#EDEDED'
    document.getElementById('navbar_group').children[1].style.background = '#EDEDED'
    document.querySelectorAll('.plan')[2].addEventListener('mouseover', () => {
      document.querySelectorAll('.plan')[1].setAttribute('style', 'transform:scale(1)!important')
    })
    document.querySelectorAll('.plan')[2].addEventListener('mouseout', () => {
      document.querySelectorAll('.plan')[1].removeAttribute('style')
    })
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
          const sub = await factoryContract.methods.subscription_prices(i).call()
          app.subscriptions.push(sub)
          i++
          if (sub === '0' && i > 1) {
            ended = true
          }
        }
        app.subscriptionActive = parseInt(await factoryContract.methods.subscriptions(app.account).call())
        app.free_mints = await factoryContract.methods.free_mints(app.account).call()
        app.epoch = await factoryContract.methods.getEpoch(app.account).call()
      }
      catch (e) {
        console.log(e)
      }
    },
    async buySubscription(subscription) {
      const app = this
      const factoryContract = new app.web3.eth.Contract(
        app.abi_factory,
        app.factory_contract
      );
      try {
        const sub = await factoryContract.methods.buySubscription(subscription).send({ from: app.account, value: app.subscriptions[subscription] })
        console.log(sub)
      }
      catch (e) {
        console.log(e)
      }
    }
  }
}
</script>