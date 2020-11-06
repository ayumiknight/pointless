
const axios = require('axios');
const { _66, tezP, k2sVR, k2sNormal } = require('./k2sConfig');
const fs = require('fs');
let downloadId = process.argv.find(one => one.match(/^--id(.+)$/));

axios({
  url: 'https://tezfiles.com/api/v2/getUrl',
  method: 'POST',
  data: JSON.stringify({
    access_token: tezP,
    file_id: downloadId.replace(/^--id(.+)$/, '$1')
  })
}).then(res => {
  console.log(res.data.url)
  axios({
    url: res.data.url,
    method: 'get',
    responseType: 'stream'
  }).then(response => {
    const fileName = response.headers['content-disposition'].replace(/^.+filename=\"(.+)\";.+$/, "$1")
    response.data.pipe(fs.createWriteStream(fileName));  
  })
})