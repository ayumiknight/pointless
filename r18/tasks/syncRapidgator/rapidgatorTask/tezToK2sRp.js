const axios = require('axios');
const { _66, tezP } = require('./k2sConfig');
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

async function tezToK2sRp({
  javInfo,
  R,
  code
}) {
  const {
    tezFiles = []
  } = javInfo;

  const k2sTargetFolder = await axios({
    url: 'https://keep2share.cc/api/v2/createFolder',
    method: 'POST',
    data: JSON.stringify({
      parent: "24be4a42f28cc",
      access_token: tezP,
      name: code,
      access: 'premium'
    })
  })
  const k2sTargetFolderId = k2sTargetFolder.data.id;

  const rpTargetFolderId = await R.createFolder(code);

  const myK2ss = []
  const myRps = []

  let index = 0;
  while(index < tezFiles.length) {
    const link = tezFiles[index]
    try {
      const tempUrl = await axios({
        url: 'https://tezfiles.com/api/v2/getUrl',
        method: 'POST',
        data: JSON.stringify({
          access_token: tezP,
          file_id: link.replace(/^https\:\/\/tezfiles.com\/file\/([a-z0-9]+)\/.+$/, "$1")
        })
      });
      const headRes = await axios({
        method: 'HEAD',
        url: tempUrl.data.url
      });
      const extension = link.split('.').pop()
      const detail = {
        extension,
        tempUrl: tempUrl.data.url,
        md5: headRes.headers.etag,
        contentLength: headRes.headers['content-length'],
        newName: code + (tezFiles.length > 1 ? `.part${index + 1}` : '') + '.jvrlibrary.' + extension
      }
      
      const k2sSaveResult = await axios({
        url: 'https://keep2share.cc/api/v2/createFileByHash',
        method: 'POST',
        data: JSON.stringify({
          access_token: tezP,
          hash: detail.md5,
          name: detail.newName,
          parent: k2sTargetFolderId,
          access: "premium"
        })
      })
      console.log(k2sSaveResult.data, '======================k2s saveresult==========')
      const rpLink = await R.tezToRpSingle({
        newName: detail.newName,
        detail,
        folderId: rpTargetFolderId
      })
      myK2ss.push(k2sSaveResult.data.link + '/' + detail.newName);
      myRps.push(rpLink)
      console.log('========one file success=========', myK2ss, myRps)
    } catch(e) {
      console.log(e.message, '===========tez to k2s rp single====', link)
    }
    index++;
  }
  javInfo.k2s = myK2ss;
  javInfo.rapidgator = myRps;
}
module.exports = tezToK2sRp;