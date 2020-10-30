const axios = require('axios');
const { _66, tezP } = require('./k2sConfig');
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

async function k2sToK2s({
  javInfo,
  code
}) {
  const {
    k2s = []
  } = javInfo;

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
        newName: code + (k2s.length > 1 ? `.part${index + 1}` : '') + '.jvrlibrary.' + extension
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
      
      myK2ss.push(k2sSaveResult.data.link + '/' + detail.newName);
      console.log('========one file success=========', myK2ss)
    } catch(e) {
      console.log(e.message, '===========tez to k2s rp single====', link)
    }
    index++;
  }
  console.log('before k2s copy========', javInfo.k2s.length)
  javInfo.k2s = myK2ss;
  console.log('after k2s copy========', javInfo.k2s.length)
}

module.exports = k2sToK2s;