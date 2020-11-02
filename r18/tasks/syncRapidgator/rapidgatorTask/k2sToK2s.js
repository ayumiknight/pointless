const axios = require('axios');
const { _66, tezP, k2sVR, k2sNormal } = require('./k2sConfig');

async function k2sToK2s({
  javInfo,
  code,
  vr
}) {
  const {
    k2s = []
  } = javInfo;

  const myK2ss = [];
  const myK2sIds = [];
  let noData406;

  let index = 0;
  while(index < k2s.length) {
    const link = k2s[index]
    try {
      const tempUrl = await axios({
        url: 'https://keep2share.cc/api/v2/getUrl',
        method: 'POST',
        data: JSON.stringify({
          access_token: _66,
          file_id: link.replace(/^https\:\/\/k2s.cc\/file\/([a-z0-9]+)\/.+$/, "$1")
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
        newName: link.split('/').pop().replace('avcens.xyz','jvrlibrary').replace('avcens', 'jvrlibrary')
      }

      const k2sSaveResult = await axios({
        url: 'https://keep2share.cc/api/v2/createFileByHash',
        method: 'POST',
        data: JSON.stringify({
          access_token: tezP,
          hash: detail.md5,
          name: detail.newName,
          // parent: k2sTargetFolderId,
          access: "premium"
        })
      })
      
      myK2ss.push(k2sSaveResult.data.link + '/' + detail.newName);
      myK2sIds.push(k2sSaveResult.data.id)
      console.log('========one file success=========', myK2ss)
    } catch(e) {
      console.log(e.message, e.response && e.response.data, '===========k2s to k2s rp single====', link);
      if (e.message.match('Request failed with status code 406')) {
        noData406 = true;
        break;
      }
    }
    index++;
  }
  if (noData406) {
    return false;
  }
  if (myK2ss.length) {
    const k2sTargetFolder = await axios({
      url: 'https://keep2share.cc/api/v2/createFolder',
      method: 'POST',
      data: JSON.stringify({
        parent: vr ? k2sVR : k2sNormal,
        access_token: tezP,
        name: code,
        access: 'premium'
      })
    })
    const k2sTargetFolderId = k2sTargetFolder.data.id;
    const moveToNewFoler = await axios({
      url: 'https://keep2share.cc/api/v2/updateFiles',
      method: 'POST',
      data: JSON.stringify({
        ids: myK2sIds,
        access_token: tezP,
        new_parent: k2sTargetFolderId
      })
    })
  }
  console.log(new Date(), `k2s to k2s ${k2s.length} filecount ${myK2ss.length} success count===================`)
  return myK2ss;
}

module.exports = k2sToK2s;