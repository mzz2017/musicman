import Vue from 'vue'
import Router from 'vue-router'
import MainPage from 'components/mainPage/mainPage'

Vue.use(Router)

export default new Router({
  routes: [
    {
      mode:'history',
      path: '/',
      name: 'mainPage',
      component: MainPage
    }
  ]
})
