<template>
  <div id="navbar_group">
    <div id="navbar">
      <img src="../assets/images/logo.svg" @click="$router.push({name: 'Instances'})" style="cursor:pointer" alt="Mego Contents">
      <div class="navbar_links">
        <a href="/#/new" v-if="$route.name != 'Instances'" :class="{'has-text-weight-bold':true, 'navbar_link_active': $route.name === 'New'}"><span></span>new</a>
        <a href="/#/drafts" v-if="$route.name != 'Instances'" :class="{'has-text-weight-bold':true, 'navbar_link_active': $route.name === 'Drafts'}"><span></span>drafts</a>
        <a href="/#/public" v-if="$route.name != 'Instances'" :class="{'has-text-weight-bold':true, 'navbar_link_active': $route.name === 'Public'}"><span></span>public</a>
        <router-link :to="{name: 'Instances'}" :class="{'has-text-weight-bold':true, 'navbar_link_active': $route.name === 'Instances'}"><span></span>manage instances</router-link>
        <a style="padding: 18.5px 2rem 18.5px 2rem; border-left: 1px solid black"
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