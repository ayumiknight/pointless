
const axios = require('axios');
const link = 'https://tezfiles.com/file/681b866ee9199/jpsvr00022.part2.VR.avcens.xyz.mp4?utm_campaign=video_online';
const { _66, tezP, k2sVR, k2sNormal } = require('./k2sConfig');
const fs = require('fs');

axios({
  url: 'https://tezfiles.com/api/v2/getUrl',
  method: 'POST',
  data: JSON.stringify({
    access_token: tezP,
    file_id: link.replace(/^https\:\/\/tezfiles.com\/file\/([a-z0-9]+)\/.+$/, "$1")
  })
}).then(res => {
  console.log(res.data)
  axios.get(res.data.url).then(response => {
    response.data.pipe(fs.createWriteStream("a.mp4"));  
  })
})