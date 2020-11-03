const axios = require('axios');
const { _66, tezP, k2sVR, k2sNormal } = require('./k2sConfig');
const k2sToK2s = require('./k2sToK2s');

async function md5ToK2s({
  code,
  filesInfo,
  vr,
  javInfo,
  P
}) {
  const myK2ss = []
  const myK2sIds = [];

  let index = 0;
  while(index < filesInfo.length) {
    const file = filesInfo[index];
    try {
      const newName = file.name;
      const k2sSaveResult = await axios({
        url: 'https://keep2share.cc/api/v2/createFileByHash',
        method: 'POST',
        data: JSON.stringify({
          access_token: tezP,
          hash: file.hash,
          name: newName,
          // parent: k2sTargetFolderId,
          access: "premium"
        })
      })
      
      myK2ss.push(k2sSaveResult.data.link + '/' + newName);
      myK2sIds.push(k2sSaveResult.data.id)
      console.log('========one file success=========', myK2ss)
    } catch(e) {
      console.log(e.message, e.response && e.response.data, '===========md5 to k2s rp single====', file.url, file.hash)
      try {
        if (file.name.split('.').pop() === 'mp4') {
          const {
            k2s = []
          } = javInfo;
          const thisFileOriginalName = file.name.replace('.jvrlibrary', '');
          const fileMatch = k2s.find(one => {
            return one.split('/').pop() === thisFileOriginalName;
          })
          console.log(thisFileOriginalName, fileMatch, '=======fill with k2s to k2s,=============== ')
          if (fileMatch) {
            const res = await k2sToK2s({
              javInfo: {
                k2s: [fileMatch]
              },
              vr,
              code,
              newName: file.name,
              idOnly: true,
              P,
              RpHash: file.hash
            })
            if (res && res.id) {
              myK2ss.push(res.link)
              myK2sIds.push(res.id)
              console.log(res.link, '=======fill with k2s to k2s success=============== ')
            }
          }
        }
      } catch(e) {
        console.log(e, `attempt to fill with k2s to k2s failed, ${file.name}========================`)
      }
    }
    index++;
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
  console.log(new Date(),`md5 to k2s ${filesInfo.length} filecount ${myK2ss.length} success count===================`)
  return myK2ss;
}

module.exports = md5ToK2s;