import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Instances from '../views/Instances.vue'
import Instance from '../views/Instance.vue'
import Drafts from '../views/Drafts.vue'
import Manage from '../views/Manage.vue'
import Public from '../views/Public.vue'
import New from '../views/New.vue'
import View from '../views/View.vue'
import Share from '../views/Share.vue'
import Pricing from '../views/Pricing.vue'
import Preview from '../views/Preview.vue'
import Users from '../views/Users.vue'

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
    path: '/manage-instance/:instance/users',
    name: 'Users',
    component: Users
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
    path: '/view/:tokenId',
    name: 'View',
    component: View
  },
  {
    path: '/share/:chain/:instance/:index',
    name: 'Share',
    component: Share
  },
  {
    path: '/public',
    name: 'Public',
    component: Public
  },
  {
    path: '/pricing',
    name: 'Pricing',
    component: Pricing
  },
  {
    path: '/preview/:hash',
    name: 'Preview',
    component: Preview
  }
]

const router = new VueRouter({
  routes
})

export default router
