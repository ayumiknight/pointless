const axios = require('axios');
const { _66, tezP } = require('./k2sConfig');

async function md5ToK2s({
  code,
  filesInfo
}) {
  const k2sTargetFolder = await axios({
    url: 'https://keep2share.cc/api/v2/createFolder',
    method: 'POST',
    data: JSON.stringify({
      parent: "a231c1cabe577",
      access_token: tezP,
      name: code,
      access: 'premium'
    })
  })
  const k2sTargetFolderId = k2sTargetFolder.data.id;
  const myK2ss = []

  let index = 0;
  while(index < filesInfo.length) {
    const file = filesInfo[index];
    try {
      const newName = code + (filesInfo.length > 1 ? `.part${index + 1}` : '') + '.jvrlibrary.' + file.name.split('.').pop()
      const k2sSaveResult = await axios({
        url: 'https://keep2share.cc/api/v2/createFileByHash',
        method: 'POST',
        data: JSON.stringify({
          access_token: tezP,
          hash: file.hash,
          name: newName,
          parent: k2sTargetFolderId,
          access: "premium"
        })
      })
      
      myK2ss.push(k2sSaveResult.data.link + '/' + detail.newName);
      console.log('========one file success=========', myK2ss)
    } catch(e) {
      console.log(e.message, e.stack, code, '===========k2s to k2s rp single====', link)
    }
    index++;
  }
  console.log(`md5 to k2s ${filesInfo.length} filecount ${myK2ss.length} success count===================`)
  return myK2ss;
}

module.exports = md5ToK2s;