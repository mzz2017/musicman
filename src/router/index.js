import Vue from 'vue'
import Router from 'vue-router'
import MainPage from 'components/mainPage/mainPage'

Vue.use(Router)

export default new Router({
  mode:'history',
  routes: [
    {
      path: '/',
      name: 'mainPage',
      component: MainPage
    }
  ]
})
