<template>
  <div class="page-wrapper" id="page-wrapper">
    <el-input :placeholder="emptyText" v-model="searchContent" class="search">
      <el-button slot="append" class="searchButton icon-fire iconfont icon" @click="handleOnClickSearch"></el-button>
    </el-input>
    <el-table
      :data="songList"
      stripe
      :empty-text="emptyText"
      class="songList"
      id="listTable">
      <el-table-column
        prop="name"
        label="歌名"
        width="180">
      </el-table-column>
      <el-table-column
        prop="album"
        label="专辑名"
        width="180">
      </el-table-column>
      <el-table-column
        prop="singer"
        label="歌手"
        width="180">
      </el-table-column>
      <el-table-column
        label="可选格式">
        <template slot-scope="scope">
          <el-button v-for="(val,format) in scope.row.fileFormats"
                     size="mini"
                     :type="val?'primary':''"
                     plain
                     :disabled="!val"
                     class="formatIcon"
                     :key="format.value"
                     @click="handleOnClickDownload(format,scope.row.strMediaMid,scope.row.name,scope.row.singer)">
            {{format}}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination" v-show="totalNum">
      <el-pagination
        layout="prev, pager, next"
        :total="totalNum"
        @current-change="handleOnCurrentPageChange"
        :page-size=15
        :current-page.sync="currentPage">
      </el-pagination>
    </div>
    <el-dialog :title="dialogDownloadTitle"
               :visible.sync="dialogDownloadVisible"
               width="30%"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :before-close="handleBeforeCloseDialogDownload">
      <div id="download">
        <el-progress :width="100"
                     type="circle"
                     :percentage="downloadProgress"
                     :status="downloadStatus"
        ></el-progress>
        <div class="tip">{{downloadSpeed}} kb/s</div>
        <div class="tip" v-show="downloadWrong">出了点问题, 请复制链接地址到下载器自行下载: <a :href="downloadURL"
                                                                           :download="downloadSaveName" target="_blank">下载链接</a>
        </div>
      </div>
    </el-dialog>
    <transition name="loading-fade">
      <loading v-if="isLoading>0"></loading>
    </transition>
  </div>
</template>
<script>
  import Loading from 'base/loading/loading'

  import axios from 'axios'
  import {download, saver} from '../../common/js/download'
  import browser from '../../common/js/browser'
  import jsonp from 'jsonp'
  import {mapState} from 'vuex'
  import store from 'store/index'

  export default {
    name: "mainPage",
    store,
    components: {
      Loading
    },
    data() {
      return {
        emptyText: '来吧！点燃MusicMan！',
        searchContent: '',
        songList: [],
        formatMap: {
          "ape": {
            prefix: "A0",
            suffix: "ape",
            mine: 'audio/ape'
          },
          "flac": {
            prefix: "F0",
            suffix: "flac",
            mine: 'audio/x-flac'
          },
          "320k": {
            prefix: "M8",
            suffix: "mp3",
            mine: 'audio/mpeg'
          },
          "128k": {
            prefix: "M5",
            suffix: "mp3",
            mine: 'audio/mpeg'
          },
        },
        totalNum: 0,
        currentPage: 1,
        searchContentKeeper: '',
        dialogDownloadVisible: false,
        dialogDownloadTitle: '成都-赵雷',
        downloadProgress: 0,
        downloadStatus: '',
        downloadSpeed: 0,
        downloadAbort: false,
        downloadWrong: false,
        downloadURL: '',
        downloadSaveName: '',
        support: null
      }
    },
    methods: {
      isSupportedBrowser() {
        //0为支持，1表示不支持，2表示极其不支持（网页被转码，影响正常效果）
        if (browser.versions.mobile) {//判断是否是移动设备打开。browser代码在下面
          var ua = navigator.userAgent.toLowerCase();//获取判断用的对象
          let plat = browser.versions.android ? 'android' : 'ios'
          if (ua.match(/MicroMessenger/i) == "micromessenger") {
            //在微信中打开
            return {type: 'wechat', plat: plat}
          }
          if (ua.match(/WeiBo/i) == "weibo") {
            //在新浪微博客户端打开
            return {type: 'weibo', plat: plat}
          }
          if (ua.match(/QQ\//i) == "qq/") {
            //在QQ中打开
            return {type: 'qq', plat: plat}
          }
          if (ua.match(/qzone\//i) == "qzone/") {
            //在QQ空间app中打开
            return {type: 'qzone', plat: plat}
          }
          //手机端几乎都不支持用blob方式对下载文件更名
          return {type: 'mobile', plat: plat}
        }
        return {type: 'pc', plat: 'pc'}
      },
      popupNotSupported(message) {
        //使用u6.gg提供的API将网址缩短一下，弹出提示
        let currentURL = encodeURIComponent(location.href)
        currentURL = currentURL.replace('localhost', '127.0.0.1')
        let url = `http://u6.gg/api.php?format=jsonp&url=${currentURL}`
        jsonp(url, {timeout: 2500}, (err, data) => {
          if (err || data.err === '') {
            //如果出现error，则只返回location.origin
            process.env.NODE_ENV === 'development' && console.log(data.err)
            this.$alert(`${message}<br />链接地址： ${location.origin}`, 'Sorry!', {
              confirmButtonText: '朕知道了',
              dangerouslyUseHTMLString: true
            })
          } else {
            //一切顺利，返回短地址
            this.$alert(`${message}<br />链接地址： ${data.url}`, 'Sorry!', {
              confirmButtonText: '朕知道了',
              dangerouslyUseHTMLString: true
            })
          }
        })
      },
      handleOnClickDownload(format, strMediaMid, songName, singer) {
        //获取vkey
        let vkey = window.localStorage.getItem('vkey')
        //合成下载链接
        let url = `//streamoc.music.tc.qq.com/${this.formatMap[format].prefix}00${strMediaMid}.${this.formatMap[format].suffix}?vkey=${vkey}&guid=1234567890&uin=1008611&fromtag=8`
        //合成文件名
        let savename = `${songName}-${singer}.${this.formatMap[format].suffix}`
        if (this.support.plat === 'ios') {
          //ios不支持下载文件
          this.popupNotSupported('ios系统限制存在，无法下载文件，请更换设备再次操作')
          return
        } else if (this.support.plat === 'android') {
          //安卓端那就只能随缘改存储名了吧
          this.downloadOrdinarily(url, savename)
          if (this.support.type === 'qq')
            alert('注意，由于当前浏览器的兼容性问题，我们无法确定文件的保存位置和文件名，请下载完毕后自行确认！')
          return
        }
        this.downloadByXHR(url, savename, this.formatMap[format].mine)
      },
      handleOnClickSearch() {
        //改变query完成搜索
        this.$router.push({path: '', query: {s: encodeURIComponent(this.searchContent), p: '1'}})
      },
      handleOnCurrentPageChange(currentPage, lval) {
        if (currentPage === lval)
          return
        //翻页时将搜索框现在的内容改回上次记录的搜索内容，通过改变query进行搜索
        this.$router.push({path: '', query: {s: encodeURIComponent(this.searchContentKeeper), p: this.currentPage}})
      },
      search(page) {
        process.env.NODE_ENV === 'development' && console.log("进行了搜索")
        page = page ? page : 1
        axios({
          url: '/api/search',
          method: 'post',
          data: {
            page: page,
            songName: encodeURIComponent(this.searchContentKeeper),
            pageSize: 15
          },
          timeout: 5000
        }).then((response) => {
          let array = []
          process.env.NODE_ENV === 'development' && console.log(response.data.data)
          for (let index in response.data.data.song.list) {
            let item = response.data.data.song.list[index]
            let strSinger = ''
            for (let index in item.singer) {
              strSinger += (strSinger === '' ? '' : ' / ') + item.singer[index].name
            }
            let object = {
              "name": item.name,
              "album": item.album.name,
              "singer": strSinger,
              "fileFormats": {
                'ape': item.file['size_ape'] > 0,
                'flac': item.file['size_flac'] > 0,
                '320k': item.file['size_320'] > 0,
                '128k': item.file['size_128'] > 0
              },
              "strMediaMid": item.file.strMediaMid
            }
            array.push(object)
          }
          //更新歌单列表，更新分页：歌曲总数、当前页，界面到最顶
          this.totalNum = response.data.data.song.totalnum
          this.songList = array
          window.scrollTo(0, 0)
          this.currentPage = page
        }).catch((error) => {
          process.env.NODE_ENV === 'development' && console.log(error)
        })
      },
      handleBeforeCloseDialogDownload(done) {
        //下载完毕则直接可以关闭
        if (this.downloadStatus !== '') {
          done()
          return
        }
        this.$confirm('确认停止下载？')
          .then(() => {
            this.downloadAbort = true
            done();
          })
          .catch((error) => {
            process.env.NODE_ENV === 'development' && console.log(error)
          });
      },
      searchByQuery() {
        //根据query填充搜索框并完成搜索
        if (this.$route.query.hasOwnProperty('s')) {
          this.searchContentKeeper = this.searchContent = decodeURIComponent(this.$route.query.s)
          let page = 1
          if (this.$route.query.hasOwnProperty('p')) {
            page = parseInt(this.$route.query.p)
            page = isNaN(page) ? 1 : page
          }
          this.search(page)
        }
        else {
          //  说明在主页了，清空数据
          this.totalNum = 0
          this.songList = []
          this.searchContent = ''
          window.scrollTo(0, 0)
        }
      },
      getVkey() {
        axios({
          url: '/api/vkey',
          methods: 'get',
          timeout: 5000
        }).then((response) => {
          let vkey = response.data.vkey
          window.localStorage.setItem('vkey', vkey)
          window.localStorage.setItem('vkey_expire', Date.parse(new Date().toUTCString()).toString())
        }).catch((error) => {
          process.env.NODE_ENV === 'development' && console.log('getVkey', error)
        })
      },
      downloadOrdinarily(url, savename) {
        if (saver(url, savename))
          return true
        else
          return window.open(url, '_blank')
      },
      downloadByXHR(url, savename, mineType) {
        //显示下载对话框
        this.downloadWrong = false
        this.dialogDownloadVisible = true
        this.dialogDownloadTitle = savename
        //创建XMLHttpRequest对象
        let req = new XMLHttpRequest();
        //类型设为blob
        req.responseType = "blob"
        req.open("GET", url, true);
        //初始化变量
        let that = this
        this.downloadAbort = false
        this.downloadProgress = 0
        this.downloadStatus = ''

        let beginTime = Date.parse(new Date().toUTCString())
        let lastCountTime = beginTime
        //监听下载进度
        req.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            if (that.downloadAbort) {
              that.downloadAbort = false
              req.abort()
            }
            that.downloadProgress = Math.floor(event.loaded / event.total * 100)
            //取下载速度(B/ms, 即KB/s), 速度更新间隔为0.5s
            let nowTime = Date.parse(new Date().toUTCString())
            if (nowTime - lastCountTime > 500) {
              lastCountTime = nowTime
              that.downloadSpeed = Math.floor(event.loaded / (nowTime - beginTime))
            }
            // console.log(event)
          }
        }, false)
        //下载完毕事件
        req.onreadystatechange = function () {
          if (req.readyState === 4 && req.status === 200) {
            if (download(req.response, savename, mineType) === false) {
              this.downloadOrdinarily(url, savename)
            }
            that.downloadStatus = 'success'
          } else if (req.readyState === 4 && req.status !== 200) {
            //下载出了问题
            that.downloadWrong = true
            that.downloadURL = `http:${url}`
            that.downloadSaveName = savename
            that.downloadStatus = 'exception'
          }
        }
        //敬请开始吧
        req.send(null)
      },
      compatibilityCheck() {
        this.support = this.isSupportedBrowser()
        if (this.support.type === 'wechat' || (this.support.plat === 'android' && this.support.type === 'weibo')) {
          // this.popupNotSupported('亲，我们检测到了不兼容问题，换个浏览器打开我吧！') //经转码后无法显示
          this.emptyText = 'not support'
          //试了很久发现下面这个写法才行
          location.replace('/static/notsupport.html')
          return
        }
      }
    },
    created() {
      this.compatibilityCheck()

      // 如果没有vkey或者vkey已经超时2个小时了，就再获取一下vkey
      if (!window.localStorage.getItem('vkey') || Date.parse(new Date().toUTCString()) - parseInt(window.localStorage.getItem('vkey_expire')) > 2 * 60 * 60 * 1000) {
        this.getVkey()
      }
      //按下Enter开始搜索
      window.onkeyup = (e) => {
        if (e.key === 'Enter') {
          this.handleOnClickSearch()
        }
      }
      //根据query搜索
      this.searchByQuery()
    },
    computed: {
      query() {
        return this.$route.fullPath
      },
      ...mapState(['isLoading'])
    },
    watch: {
      query() {
        //监测query，一旦改变就搜索
        process.env.NODE_ENV === 'development' && console.log('query改变了，进行搜索')
        this.searchByQuery()
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../../common/scss/mainPage";
</style>

<style lang="scss">
  //强行改写element-ui样式
  .songList {
    th {
      text-align: center !important;
    }
    .cell, .cell .formatIcon {
      display: flex !important;
      justify-content: center !important;
    }
    .invisible {
      visibility: hidden !important;
    }
  }

  .el-message-box {
    vertical-align: top !important;
    margin-top: 22vh !important;
  }
</style>
