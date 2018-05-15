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
        :page-size=15>
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
        <div id="downloadSpeed">{{downloadSpeed}} kb/s</div>
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
        searchContentKeeper: '',
        dialogDownloadVisible: false,
        dialogDownloadTitle: '成都-赵雷',
        downloadProgress: 0,
        downloadStatus: '',
        downloadSpeed: 0,
        downloadAbort: false
      }
    },
    methods: {
      handleOnClickDownload(format, strMediaMid, songName, singer) {
        //获取vkey
        let vkey = window.localStorage.getItem('vkey')
        //合成下载链接
        let url = `http://streamoc.music.tc.qq.com/${this.formatMap[format].prefix}00${strMediaMid}.${this.formatMap[format].suffix}?vkey=${vkey}&guid=1234567890&uin=1008611&fromtag=8`
        //合成文件名
        let savename = `${songName}-${singer}.${this.formatMap[format].suffix}`
        //显示下载对话框
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
            console.log(event)
          }
        }, false)
        //下载完毕事件
        req.onreadystatechange = function () {
          if (req.readyState === 4 && req.status === 200) {
            let blob = new Blob([req.response], {type: 'application/force-download'})
            download(blob, savename)
            that.downloadStatus = 'success'
          }
        }
        //敬请开始吧
        req.send(null)
      },
      handleOnClickSearch(page) {
        //记录下这次搜索的内容，翻页的时候搜索不会因为实时更改的searchContent而改变搜索内容
        this.searchContentKeeper = this.searchContent
        this.search(page)
      },
      handleOnCurrentPageChange(currentPage) {
        //翻页时将搜索框现在的内容改回上次记录的搜索内容
        this.searchContent = this.searchContentKeeper
        this.search(currentPage)
      },
      search(page) {
        page = page ? page : 0
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
          this.totalNum = response.data.data.song.totalnum
          this.songList = array
          window.scrollTo(0, 0)
        }).catch((error) => {
          process.env.NODE_ENV === 'development' && console.log(error)
        })
      },
      handleBeforeCloseDialogDownload(done) {
        //下载完毕则直接可以关闭
        if (this.downloadStatus !== ''){
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
      }
    },
    created() {
      // 如果没有vkey或者vkey已经超时2个小时了，就再获取一下vkey
      if (!window.localStorage.getItem('vkey') || Date.parse(new Date().toUTCString()) - parseInt(window.localStorage.getItem('vkey_expire')) > 2 * 60 * 60 * 1000) {
        this.getVkey()
      }
      window.onkeyup = (e) => {
        if (e === event && e.key === 'Enter') {
          this.handleOnClickSearch()
        }
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
