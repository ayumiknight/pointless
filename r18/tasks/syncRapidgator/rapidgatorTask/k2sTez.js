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
  const files = await Promise.all(k2s.map((one, index) => {
    const extension = one.split('.').pop();
    return k2sToK2sSingle({
      link: one,
      newName: code + (k2s.length > 1 ? `.part${index + 1}` : '') + '.jvrlibrary.' + extension,
      folder: folder.data.id
    })
  }).catch(e => {
    return null
  }))
  javInfo.k2s = files.filter(el => !!el).map(el => {
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

async function tezToK2s({
  code,
  javInfo
}) {
  const {
    tezFileDetails = []
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
  const files = await Promise.all(tezFileDetails.map((one, index) => {
    const {
      extension
    } = one;
    return tezToK2sSingle({
      detail: one,
      newName: code + (tezFiles.length > 1 ? `.part${index + 1}` : '') + '.jvrlibrary.' + extension,
      folder: folder.data.id
    })
  }).catch(e => {
    return null
  }))
  javInfo.k2s = files.filter(el => !!el).map(el => {
    return el.link + '/' + el.name
  })
}
async function populateTezData({
  javInfo
}) {
  const {
    tezFiles = []
  } = javInfo;
  const tezFileDetails = await Promise.all(tezFiles.map(link => {
    return new Promise(async (resolve, reject) => {
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
        return {
          extension: link.split('.').pop(),
          tempUrl: tempUrl.data.url,
          md5: headRes.headers.etag,
          contentLength: headRes.headers['content-length']
        }
      } catch(e) {
        console.log(e.message, '===========error at populateTezData====', link)
        reject(e)
      }
    })
  }).catch(e => {
    return null;
  }))
  javInfo.tezFileDetails = tezFileDetails.filter(el => !!el);
}
module.exports = {
  k2sToK2s,
  tezToK2s,
  populateTezData
}