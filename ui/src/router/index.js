import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Drafts from '../views/Drafts.vue'
import Manage from '../views/Manage.vue'
import Public from '../views/Public.vue'
import New from '../views/New.vue'
import Api from '../views/Api.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/new',
    name: 'New',
    component: New
  },
  {
    path: '/drafts',
    name: 'Drafts',
    component: Drafts
  },
  {
    path: '/manage/:tokenId',
    name: 'Manage',
    component: Manage
  },
  {
    path: '/public',
    name: 'Public',
    component: Public
  },
  {
    path: '/api',
    name: 'Api',
    component: Api
  }
]

const router = new VueRouter({
  routes
})

export default router
