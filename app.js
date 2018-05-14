const express = require('express')
const app = express()
var apiRoutes = express.Router()

var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var axios = require('axios')
app.use('/api', apiRoutes)
const PORT = 9000

function getVkey() {
  axios({
    url: getVkeyUrl,
    methods: 'get'
  }).then((response) => {
    return response.data.items[0].vkey
  }).catch((error) => {
    console.log('getVkey', error)
  })
}

app.post('/api/search', jsonParser, (req, res) => {
  let body = req.body
  if (body.songName === undefined) {
    res.status(400).send('')
  }
  if (!body.page)
    body.page = 0
  // console.log(body)
  let url = `http://c.y.qq.com/soso/fcgi-bin/client_search_cp?ct=24&qqmusic_ver=1298&new_json=1&remoteplace=txt.yqq.center&t=0&aggr=1&cr=1&catZhida=1&lossless=0&flag_qc=0&p=${body.page}&n=${body.pageSize}&w=${body.songName}&&jsonpCallback=searchCallbacksong2020&format=json&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0`
  axios({
    url: url,
    method: 'get'
  }).then((response) => {
    res.json(response.data)
  }).catch((error) => {
    res.status(400).send('')
  })
})

app.get('/api/vkey', (req, res) => {
  let uin = '1008611'
  let guid = '1234567890'
  let getVkeyUrl = `http://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg?g_tk=0&loginUin=${uin}&hostUin=0&format=json&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0&cid=205361747&uin=${uin}&songmid=003a1tne1nSz1Y&filename=C400003a1tne1nSz1Y.m4a&guid=${guid}`
  axios({
    url: getVkeyUrl,
    methods: 'get'
  }).then((response) => {
    res.json({vkey: response.data.data.items[0].vkey})
  }).catch((error) => {
    console.log('getVkeyError', error)
    res.status(400).send('')
  })
})

app.listen(PORT, (err) => {
  if (err)
    console.log(err)
  else
    console.log(`Listening at localhost:${PORT}`)
})
