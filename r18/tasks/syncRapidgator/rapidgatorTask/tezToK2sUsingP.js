const axios = require('axios');
const { _66, tezP, k2sVR, k2sNormal } = require('./k2sConfig');

async function tezToK2sRp({
  javInfo,
  P,
  code,
  vr
}) {
  const {
    tezFiles = []
  } = javInfo;

  // const rpTargetFolderId = await R.createFolder(code);

  const myK2ss = [];
  const myK2sIds = [];
  let noData406;

  let index = 0;
  while(index < tezFiles.length) {
    const link = tezFiles[index]

    try {
      const tempUrl = await P.getMD5LinkFor({
        link,
        type: 'tez'
      })

      const headRes = await axios({
        method: 'HEAD',
        url: tempUrl
      });
      const extension = link.split('.').pop()
      const detail = {
        extension,
        tempUrl: tempUrl,
        md5: headRes.headers.etag.replace(/"/g, ''),
        contentLength: headRes.headers['content-length'],
        newName: link.split('/').pop().replace('avcens.xyz','jvrlibrary').replace('avcens', 'jvrlibrary')
      }
      
      console.log(detail, '========tez to k2s using p file detail============')
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
      // console.log(k2sSaveResult.data, '======================k2s saveresult==========')
      // const rpLink = await R.tezToRpSingle({
      //   newName: detail.newName,
      //   detail,
      //   folderId: rpTargetFolderId
      // })
      myK2ss.push(k2sSaveResult.data.link + '/' + detail.newName);
      myK2sIds.push(k2sSaveResult.data.id);
      // myRps.push(rpLink)
    } catch(e) {
      console.log(e.message, e.url, e.response && e.response.data, '===========tez to k2s using p single====', link)
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
  console.log(new Date(),`tez to k2s using p ${tezFiles.length} filecount ${myK2ss.length} success count===================`)
  return myK2ss;
  
}
module.exports = tezToK2sRp;