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
                     @click="handleOnClickDownload(format,scope.row.strMediaMid)">{{format}}
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
  </div>
</template>

<script>
  import axios from 'axios'

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
        searchContentKeeper: ''
      }
    },
    methods: {
      handleOnClickDownload(format, strMediaMid) {
        let vkey = window.localStorage.getItem('vkey')
        let url = `http://streamoc.music.tc.qq.com/${this.formatMap[format].prefix}00${strMediaMid}.${this.formatMap[format].suffix}?vkey=${vkey}&guid=1234567890&uin=1008611&fromtag=8`
        window.open(url, '_blank')
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
            this.totalNum = response.data.data.song.totalnum
          }
          this.songList = array
          window.scrollTo(0, 0)
        }).catch((error) => {
          process.env.NODE_ENV === 'development' && console.log(error)
        })
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
        if (e === event && e.key==='Enter') {
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
  .songList {
    th {
      text-align: center;
    }
    .cell, .cell .formatIcon {
      display: flex;
      justify-content: center;
    }
    .invisible {
      visibility: hidden;
    }
  }
</style>
