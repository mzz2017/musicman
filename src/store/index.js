import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    isLoading: 0
  },
  mutations: {
    changeLoadingState(state, ope) {
      if (ope) {
        state.isLoading++
      } else {
        state.isLoading--
      }
    }
  }
})
