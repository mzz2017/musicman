// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import 'element-ui/lib/theme-chalk/index.css'
import 'normalize.css'
import 'common/scss/_HYfont.css'
import 'interceptor/interceptor'
import {Input, Table, Button, TableColumn, Pagination, Dialog, Progress} from 'element-ui'

Vue.use(Input)
Vue.use(Table)
Vue.use(Button)
Vue.use(TableColumn)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Progress)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: {App},
  template: '<App/>'
})
