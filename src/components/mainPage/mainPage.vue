<template>
  <div class="page-wrapper">
    <el-input placeholder="来吧！点燃MusicMan！" v-model="songName" class="search">
      <el-button slot="append" class="searchButton icon-fire iconfont icon" @click="handleOnClickSearch"></el-button>
    </el-input>
    <el-table
      :data="songList"
      stripe
      empty-text="来吧！点燃MusicMan！"
      class="songList">
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
  </div>
</template>

<script>
  import axios from 'axios'

  export default {
    name: "mainPage",
    data() {
      return {
        songName: '',
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
        }
      }
    },
    methods: {
      handleOnClickDownload(format, strMediaMid) {
        //这个vkey应该是一个vip用户的，不知道什么时候会过期
        let vkey = 'DA5451EECBE1E359F79C6240498EF8C9C29822D2DCDF8053703A205063985AB5B64E37EF5207C0E5E5A7F49B13D92D6A5595255EE1BB1406'
        let url = `http://streamoc.music.tc.qq.com/${this.formatMap[format].prefix}00${strMediaMid}.${this.formatMap[format].suffix}?vkey=${vkey}&guid=1234567890&uin=1008611&fromtag=8`
        window.open(url, '_blank')
      },
      handleOnClickSearch() {
        let page = 0
        axios({
          url: '/api/search',
          method: 'post',
          data: {
            page: page,
            songName: encodeURIComponent(this.songName)
          }
        }).then((response) => {
          let array = []
          console.log(response.data.data)
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
          this.songList = array
        }).catch((error) => {
          process.env.NODE_ENV === 'development' && console.log(error)
        })
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
