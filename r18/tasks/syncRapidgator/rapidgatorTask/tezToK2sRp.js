const axios = require('axios');
const { _66, tezP } = require('./k2sConfig');
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

async function k2sToK2sSingle({
  link,
  newName,
  folder
}) {
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
  const md5 = headRes.headers.etag;
  const myCopy = await axios({
    url: 'https://keep2share.cc/api/v2/createFileByHash',
    method: 'POST',
    data: JSON.stringify({
      access_token: tezP,
      hash: md5,
      name: newName,
      parent: folder,
      access: "premium"
    })
  })
  return {
    ...myCopy.data,
    name: newName
  }
}

async function k2sToK2s({
  code,
  javInfo
}) {
  const {
    k2s = []
  } = javInfo;
  const folder = await axios({
    url: 'https://keep2share.cc/api/v2/createFolder',
    method: 'POST',
    data: JSON.stringify({
      parent: "a231c1cabe577",
      access_token: tezP,
      name: code,
      access: 'premium'
    })
  })
  
  let myK2ss = []
  let index = 0;

  while(index < k2s.length) {
    try {
      const one = k2s[index];
      const extension = one.split('.').pop();
      const myK2s = await k2sToK2sSingle({
        link: one,
        newName: code + (k2s.length > 1 ? `.part${index + 1}` : '') + '.jvrlibrary.' + extension,
        folder: folder.data.id
      })
      myK2ss.push(myK2s)
    } catch(e) {
      console.log('==============error at k22ToK2sSingle ==============', e.message)
    }
    index++;
  }
  javInfo.k2s = myK2ss.map(el => {
    return el.link + '/' + el.name
  })
}

async function tezToK2sSingle({
  detail,
  newName,
  folder
}) {
  const {
    md5
  } = detail
 
  return {
    ...myCopy.data,
    name: newName
  }
}


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
      parent: "a231c1cabe577",
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