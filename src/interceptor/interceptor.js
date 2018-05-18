import axios from 'axios'
import store from 'store/index'

axios.interceptors.request.use((config) => {
  store.commit('changeLoadingState', true)
  return config
}, (errer) => {
  return Promise.reject(errer)
})

axios.interceptors.response.use((res) => {
  store.commit('changeLoadingState', false)
  return res
}, (error) => {
  store.commit('changeLoadingState', false)
  return Promise.reject(error)
})
