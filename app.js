const express = require('express')
const app = express()
var apiRoutes = express.Router()

var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var axios = require('axios')
app.use('/api', apiRoutes)
const PORT = 9000
app.post('/api/search', jsonParser, (req, res) => {
  let body = req.body
  if (body[0] === undefined) {
    res.status(400).send('')
  }
  // console.log(body)
  let url = `http://c.y.qq.com/soso/fcgi-bin/client_search_cp?ct=24&qqmusic_ver=1298&new_json=1&remoteplace=txt.yqq.center&t=0&aggr=1&cr=1&catZhida=1&lossless=0&flag_qc=0&p=${body.page}&n=30&w=${body.songName}&&jsonpCallback=searchCallbacksong2020&format=json&inCharset=utf8&outCharset=utf-8&notice=0&platform=yqq&needNewCode=0`
  axios({
    url: url,
    method: 'get'
  }).then((response) => {
    res.json(response.data)
  }).catch((error) => {
    res.status(400).send('')
  })
})
app.listen(PORT, (err) => {
  if (err)
    console.log(err)
  else
    console.log(`Listening at localhost:${PORT}`)
})
