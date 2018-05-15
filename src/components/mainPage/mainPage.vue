<template>
  <div class="page-wrapper" id="page-wrapper">
    <el-input placeholder="来吧！点燃MusicMan！" v-model="searchContent" class="search">
      <el-button slot="append" class="searchButton icon-fire iconfont icon" @click="handleOnClickSearch"></el-button>
    </el-input>
    <el-table
      :data="songList"
      stripe
      empty-text="来吧！点燃MusicMan！"
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
  </div>
</template>

<script>
  import axios from 'axios'
  import download from '../../common/js/download'

  export default {
    name: "mainPage",
    data() {
      return {
        searchContent: '',
        songList: [],
        formatMap: {
          "ape": {
            prefix: "A0",
            suffix: "ape"
          },
          "flac": {
            prefix: "F0",
            suffix: "flac"
          },
          "320k": {
            prefix: "M8",
            suffix: "mp3"
          },
          "128k": {
            prefix: "M5",
            suffix: "mp3"
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
        downloadSaveName: ''
      }
    },
    methods: {
      handleOnClickDownload(format, strMediaMid, songName, singer) {
        //获取vkey
        let vkey = window.localStorage.getItem('vkey')
        //合成下载链接
        let url = `//streamoc.music.tc.qq.com/${this.formatMap[format].prefix}00${strMediaMid}.${this.formatMap[format].suffix}?vkey=${vkey}&guid=1234567890&uin=1008611&fromtag=8`
        //合成文件名
        let savename = `${songName}-${singer}.${this.formatMap[format].suffix}`
        this.downloadByXHR(url, savename)
      },
      handleOnClickSearch() {
        //改变query完成搜索
        this.$router.push({path: '', query: {s: encodeURIComponent(this.searchContent), p: this.currentPage}})
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
          }
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
      },
      getVkey() {
        axios({
          url: '/api/vkey',
          methods: 'get'
        }).then((response) => {
          let vkey = response.data.vkey
          window.localStorage.setItem('vkey', vkey)
          window.localStorage.setItem('vkey_expire', Date.parse(new Date().toUTCString()).toString())
        }).catch((error) => {
          process.env.NODE_ENV === 'development' && console.log('getVkey', error)
        })
      },
      downloadByXHR(url, savename) {
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
            //取下载速度(B/ms, 即KB/s), 速度变动间隔为1s
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
            let blob = new Blob([req.response], {type: 'application/force-download'})
            download(blob, savename)
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
      }
    },
    created() {
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
      //根据search搜索
      this.searchByQuery()
    },
    computed: {
      query() {
        return this.$route.query
      }
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
