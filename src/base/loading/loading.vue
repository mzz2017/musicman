<template>
  <div>
    <div class="overlay" v-if="overlay"></div>
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
      <p class="refresh" v-show="progressValue===99" @click="handleOnClickRefresh">刷新</p>
    </div>
  </div>
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
        //由于100%和宽度150px的比例是1.5……emm好吧就解释到这里好了……1.9是实验值
        progressElems[0].style.width = `${Math.round((val - 20) * 1.9)}px`
        progressElems[1].style.width = val < 20 ? `${val}px` : val < 80 ? '20px' : `${100 - val}px`
      },
      progress(val) {
        this.progressValue = Math.max(val, this.progressValue)
      }
    },
    methods: {
      progressing() {
        //这里控制默认加载速度
        let cnt = 0
        setInterval(() => {
          cnt++
          //自动增加的进度最大为99, 若设定的进度大于自动进度，则取设定的进度
          this.progressValue = Math.max(Math.min(10 * cnt, 99), this.progressValue)
        }, 250)
      },
      handleOnClickRefresh() {
        console.log('clicked')
        location.reload(true)
      }
    },
    mounted() {
      this.progressing()
    }
  }
</script>

<style lang="sass" scoped>
  @import '../../common/scss/loading'
</style>
