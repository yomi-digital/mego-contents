import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Instances from '../views/Instances.vue'
import Instance from '../views/Instance.vue'
import Drafts from '../views/Drafts.vue'
import Manage from '../views/Manage.vue'
import Public from '../views/Public.vue'
import New from '../views/New.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/instances',
    name: 'Instances',
    component: Instances
  },
  {
    path: '/manage-instance/:instance',
    name: 'Instance',
    component: Instance
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
  }
]

const router = new VueRouter({
  routes
})

export default router
