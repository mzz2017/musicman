<template>
  <transition name="loading-fade">
    <div class="loading" v-show="progressValue!==100">
      <p class="title">Loading...</p>
      <div class="progress-wrapper">
        <div class="progress-background">
          <div id="progress">
            <div class="progress"></div>
            <div class="progress"></div>
          </div>
        </div>
      </div>
      <p class="refresh" v-show="progressValue===99" @click="location.reload(true)">刷新</p>
      <div class="overlay" v-if="overlay"></div>
    </div>
  </transition>
</template>

<script>
  export default {
    name: "loading",
    props: {
      progress: {
        type: Number,
        default: 0
      },
      overlay: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        progressValue: this.progress
      }
    },
    watch: {
      progressValue(val) {
        let progressElems = document.getElementsByClassName('progress')
        progressElems[0].style.width = `${Math.round((val - 20) * 1.9)}px`
        progressElems[1].style.width = val < 20 ? `${val}px` : val < 80 ? '20px' : `${100 - val}px`
      },
      progress(val) {
        this.progressValue = Math.max(val, this.progressValue)
      }
    },
    mounted() {
      //2500是因为我将所有axios请求timeout设为了2500ms
      setTimeout(() => {
        this.progressValue = Math.max(10, this.progressValue)
      }, 250)
      setTimeout(() => {
        this.progressValue = Math.max(20, this.progressValue)
      }, 500)
      setTimeout(() => {
        this.progressValue = Math.max(40, this.progressValue)
      }, 1000)
      setTimeout(() => {
        this.progressValue = Math.max(60, this.progressValue)
      }, 1500)
      setTimeout(() => {
        this.progressValue = Math.max(80, this.progressValue)
      }, 2000)
      setTimeout(() => {
        this.progressValue = Math.max(99, this.progressValue)
      }, 2500)
    }
  }
</script>

<style lang="sass" scoped>
  @import '../../common/scss/loading'
</style>
