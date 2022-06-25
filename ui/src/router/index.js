import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Drafts from '../views/Drafts.vue'
import Manage from '../views/Manage.vue'
import Validate from '../views/Validate.vue'
import Public from '../views/Public.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
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
    path: '/validate',
    name: 'Validate',
    component: Validate
  },
  {
    path: '/public',
    name: 'Public',
    component: Public
  }
]

const router = new VueRouter({
  routes
})

export default router
