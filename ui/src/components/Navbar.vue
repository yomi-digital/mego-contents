<template>
  <div id="navbar_group">
    <div id="navbar">
      <img src="../assets/images/logo.svg" @click="$router.push({name: 'Home'})" style="cursor:pointer" alt="Mego Contents">
      <div class="navbar_links">
        <a href="/#/new" :class="{'has-text-weight-medium':true, 'navbar_link_active': $route.name === 'New'}"><span></span>new</a>
        <a href="/#/drafts" :class="{'has-text-weight-medium':true, 'navbar_link_active': $route.name === 'Drafts'}"><span></span>drafts</a>
        <a href="/#/public" :class="{'has-text-weight-medium':true, 'navbar_link_active': $route.name === 'Public'}"><span></span>public</a>
        <router-link v-if="instances.length > 0" :to="{name: 'Home'}" :class="{'has-text-weight-medium':true, 'navbar_link_active': $route.name === 'Home'}"><span></span>manage instances</router-link>
        <a href="#" style="padding: 18.5px 21px 18.5px 21px; border-left: 1px solid black"
          >{{ account.substr(0, 8) }}...{{ account.substr(-8) }}</a
        >
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
  props: ['account', 'instances']
}

</script>