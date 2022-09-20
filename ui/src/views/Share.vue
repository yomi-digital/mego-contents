<template>
  <div class="home">
    <div class="instances_container" style="margin-top:-1rem">
      <div class="instance_info" v-if="!loading && Object.keys(content).length === 0">
        <h2>NFT NOT FOUND</h2>
      </div>
      <div class="project_container" v-if="!loading && Object.keys(content).length !== 0">
        <div class="img_container">
          <div
            :style="'background-image: url('+content.image.replace('ipfs://', 'https://ipfs.yomi.digital/ipfs/')+')'">
          </div>
        </div>
        <div class="body_container">
          <h1 v-html="content.name"></h1>
          <h2 v-html="'by '+content.author"></h2>
          <div v-for="input in datatypes[category]" v-bind:key="input.name" class="body my-4">
            <h4 v-html="input.name"></h4>
            <p v-html="content[input.name]" v-if="input.name != 'image'"></p>
            <img style="width:700px;margin-top: 1rem;"
              :src="content['image'].replace('ipfs://', 'https://ipfs.yomi.digital/ipfs/')" alt=""
              v-if="input.name == 'image'">
          </div>
        </div>
      </div>
      <b-button type="button" class="button-dark is-light"
        style="background:#111!important;color:white!important;width:120px;margin-top: -2rem;"
        v-if="!loading && Object.keys(content).length === 0" @click="$router.push({name:'Public'})">
        GO BACK
      </b-button>
    </div>
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
import axios from "axios";

export default {
  name: "Share",
  data() {
    return {
      axios: axios,
      instance: "",
      hash: '',
      isWorking: false,
      loading: true,
      workingMessage: "",
      content: {}
    };
  },
  async mounted() {
    const app = this;
    app.instance = app.$route.params.instance;
    app.hash = app.$route.params.hash;
    await app.fetchNft()
    app.loading = false
  },
  methods: {
    async fetchNft() {
      try {
        const nft = await axios.get('')
      }
      catch (e) {
        alert(e)
      }
    },
    openTab(link) {
      window.open(link, '_blank')
    }
  },
};
</script>
