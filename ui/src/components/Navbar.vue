<template>
  <div id="navbar_group">
    <div id="navbar">
      <img src="../assets/images/logo.svg" @click="$router.push({name: 'Instances'})" style="cursor:pointer"
        alt="Mego Contents">
      <div class="navbar_links">
        <a @click="$emit('initTutorial')" v-if="$route.name === 'Instances' || $route.name === 'Instance'">
          <font-awesome-icon icon="fa-solid fa-circle-play" style="font-size:17px;color: black; margin:0 .3rem" />need
          help?
        </a>
        <router-link :to="{name: 'Instance', params: {instance: instance}}"
          v-if="$route.name !== 'Instances' && $route.name !== 'Pricing'" id="instance_link"
          :class="{'has-text-weight-bold':true, 'navbar_link_active': $route.name === 'Instance'}">
          <span></span>instance
          <font-awesome-icon icon="fa-solid fa-angle-down" id="caret_down" />
          <div v-if="$route.name !== 'Instances' && $route.name !== 'Pricing'" class="instance_submenu"
            @click="preventdf($event)">
            <router-link :to="{name: 'Users'}"
              :class="{'has-text-weight-bold':true, 'navbar_link_active': $route.name === 'Users'}">
              <span></span>collaborators
            </router-link>
            <router-link :to="{name: 'New'}"
              :class="{'has-text-weight-bold':true, 'navbar_link_active': $route.name === 'New'}"><span></span>new
            </router-link>
            <router-link :to="{name: 'Drafts'}"
              :class="{'has-text-weight-bold':true, 'navbar_link_active': $route.name === 'Drafts'}"><span></span>drafts
            </router-link>
            <router-link :to="{name: 'Public'}"
              :class="{'has-text-weight-bold':true, 'navbar_link_active': $route.name === 'Public'}"><span></span>public
            </router-link>
          </div>
        </router-link>
        <router-link :to="{name: 'Instances'}"
          :class="{'has-text-weight-bold':true, 'navbar_link_active': $route.name === 'Instances'}"><span></span>manage
          instances
        </router-link>
        <router-link :to="{name: 'Pricing'}"
          :class="{'has-text-weight-bold':true, 'navbar_link_active': $route.name === 'Pricing'}">
          <span></span> subscription
          <font-awesome-icon v-if="subscriptionAlert" icon="fa-solid fa-circle-exclamation"
            style="font-size:15px;color: #ff850f;" />
        </router-link>
        <a class="account_btn">
          <template v-if="account">
            <img src="../assets/images/matic-logo.svg" alt="Matic chain"
              v-if="chain === 'polygon' || chain === 'mumbai'" style="width:25px;translate:0 7px">
            <font-awesome-icon icon="fa-brands fa-ethereum"
              style="font-size: 18px;color: #126cff;translate: 0 1px;margin-right: 4px;"
              v-if="chain === 'goerli' || chain === 'ethereum'" />
            {{ account.substr(0, 8) }}...{{ account.substr(-8) }}
            <font-awesome-icon icon="fa-solid fa-angle-down" class="ml-2 caret_down" />
          </template>
          <div class="chains_list" v-if="account">
            <div v-for="(ch, index) in Object.keys(chains)" :key="index"
              @click="(chain !== ch && ch !== 'ethereum' && ch !== 'polygon') ? $emit('chooseChain', ch) : ''">
              <div v-if="chain==ch"
                style="width: 8px;height: 8px;border-radius: 100%;background: #71ff9e; position:relative;margin:.6rem .6rem 0 0">
              </div>
              <img src="../assets/images/matic-logo.svg" alt="Matic chain" v-if="ch === 'polygon' || ch === 'mumbai'"
                style="width:25px">
              <font-awesome-icon icon="fa-brands fa-ethereum"
                style="font-size: 18px;color: #126cff;translate: 0 5px;margin-right: 2px;"
                v-if="ch === 'goerli' || ch === 'ethereum'" />
              <p :style="ch === chain ? 'font-weight:700' : ''">{{ch}}</p>
            </div>
          </div>
          <b-button type="button" class="button-dark is-light is-small" id="connectWalletNavBtn" v-else
            style="background:#111!important;color:white!important;display: inline-block;margin: auto!important;"
            @click="$router.push({name: 'Instances'})">
            CONNECT WALLET
          </b-button>
        </a>
      </div>
    </div>
    <div>
      <h1 style="margin-left: 0">YOUR</h1>
      <h1>DECENTRALIZED</h1>
      <h1 style="margin-right: 0">CMS</h1>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Navbar',
  props: ['account', 'instances', 'subscriptionAlert', 'instance', 'chains', 'chain'],
  methods: {
    preventdf(event) {
      //Preventing instances click
      event.preventDefault()
    },
    fixMenuHover(routeName) {
      console.log(routeName)
      if (routeName !== 'Instances' && routeName !== 'Pricing') {
        document.querySelector('.account_btn').addEventListener('mouseover', () => {
          document.querySelector('.instance_submenu')?.classList?.add('fadeOut')
          document.getElementById('caret_down')?.classList?.add('noRotate')
        })
        document.querySelector('.account_btn').addEventListener('mouseout', () => {
          document.querySelector('.instance_submenu')?.classList?.remove('fadeOut')
          document.getElementById('caret_down')?.classList?.remove('noRotate')
        })
      }
    }
  },
  watch: {
    '$route'(to, from) {
      this.fixMenuHover(to.name)
    }
  },
  mounted() {
    this.fixMenuHover(this.$route.name)
  }
}

</script>

<style>
#connectWalletNavBtn span {
  width: unset;
  height: unset;
  line-height: 1px;
}
</style>