<template>
  <div class="home">
    <div class="instances_container" style="margin-top:-3rem">
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
          <h2>by <i @click="openTab(explorer_url+'/address/'+content.author)" v-html="content.author"></i></h2>
          <div v-for="key in Object.keys(content)" :key="key" class="body my-4">
            <template
              v-if="key !== 'name' && key !== 'title' && key !== 'author' && key !== 'category' && key !== 'timestamp'">
              <h4 v-html="key"></h4>
              <p v-html="content[key]" v-if="key !== 'image' && content[key].indexOf('ipfs') === -1"></p>
              <img style="width:700px;margin-top: 1rem;"
                :src="content['image'].replace('ipfs://', 'https://ipfs.yomi.digital/ipfs/')" alt=""
                v-if="key === 'image'">
              <iframe v-if="key !== 'image' && content[key].indexOf('ipfs') !== -1"
                :src="content[key].replace('ipfs://', 'https://ipfs.yomi.digital/ipfs/')" frameborder="0"></iframe>
            </template>
          </div>
        </div>
      </div>
      <b-button type="button" class="button-dark is-light"
        style="background:#111!important;color:white!important;width:120px;margin-top: -1rem;"
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
      contents_api: process.env.VUE_APP_CONTENTS_API,
      instance: "",
      index: '',
      isWorking: false,
      loading: true,
      workingMessage: "",
      content: {}
    };
  },
  async mounted() {
    document.getElementById('navbar_group').children[1].style.background = 'white'
    const app = this;
    app.instance = app.$route.params.instance;
    app.index = app.$route.params.index;
    await app.fetchNft()
    app.loading = false
  },
  methods: {
    async fetchNft() {
      try {
        const nft = await axios.get(this.contents_api + '/contents/' + this.instance + '/' + this.index)
        if(nft.data.metadata) {
          this.content = nft.data.metadata
        }
        else {
          this.content = {}
        }
      }
      catch (e) {
        this.content = {}
      }
    },
    openTab(link) {
      window.open(link, '_blank')
    }
  },
};
</script>
