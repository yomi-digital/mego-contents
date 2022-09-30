import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import './themes/style.scss'
import './themes/resp.scss'

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { faCircleNotch,faPlus,faLink, faCircleInfo, faCircleExclamation, faMagnifyingGlass, faCirclePlay, faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'
/* add icons to the library */
library.add(faCircleNotch,faPlus,faLink, faCircleInfo, faCircleExclamation, faMagnifyingGlass, faCirclePlay, faAngleDown, faEthereum)

/* add font awesome icon component */
Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.use(Buefy)
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')


