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
        <router-link :to="{name: 'Instance', params: {instance: instance}}" v-if="$route.name !== 'Instances' && $route.name !== 'Pricing'" id="instance_link"
          :class="{'has-text-weight-bold':true, 'navbar_link_active': $route.name === 'Instance'}">
          <span></span>instance<font-awesome-icon icon="fa-solid fa-angle-down" />
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
        <a style="padding: 18.5px 2rem 18.5px 2rem; border-left: 1px solid black;cursor: default;">
          <template v-if="account">{{ account.substr(0, 8) }}...{{ account.substr(-8) }}</template>
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
  props: ['account', 'instances', 'subscriptionAlert', 'instance'],
  methods: {
    preventdf(event) {
      //Preventing instances click
      event.preventDefault()
    }
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