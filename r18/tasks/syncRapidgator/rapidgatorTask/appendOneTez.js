const axios = require('axios');
const { _66, tezP, k2sVR, k2sNormal, host, VR, Normal } = require('./k2sConfig');
const fs = require('fs');
const { exec } = require('child_process');
const { Extra } = require('../../../sequelize/index.js');

async function download({
  tezK2sId,
  type
}) {
  let res
  if (type === 'k2s') {
    res = await axios({
      url: 'https://k2s.cc/api/v2/getUrl',
      method: 'POST',
      data: JSON.stringify({
        access_token: _66,
        file_id: tezK2sId
      })
    });
  } else {
    res = await axios({
      url: 'https://tezfiles.com/api/v2/getUrl',
      method: 'POST',
      data: JSON.stringify({
        access_token: tezP,
        file_id: tezK2sId
      })
    });
  }
  if (res && res.data && res.data.url) {
    console.log(res.data.url);
    return new Promise(async (resolve, reject) => {
      try {
        const download = await axios({
          url: res.data.url,
          method: 'get',
          responseType: 'stream'
        });
        const fileName = download.headers['content-disposition'].replace(/^.+filename=\"(.+)\";.+$/, "$1");
        download.data.on('end', () => {
          resolve(fileName)
        })
        download.data.pipe(fs.createWriteStream(fileName));
        
      } catch(e) {
        reject(e)
      }
    }) 
  }
}

async function getMD5(fileName) {
  return new Promise((resolve) => {
    if (process.platform.match(/^win.+$/)) {
      exec(`certutil -hashfile ${fileName} MD5`, function(error, stdout) {
        const md5 = stdout.split('\n')[1];
        resolve(md5.trim())
      })
    } else {
      exec(`openssl md5 '${fileName}'`, function(error, stdout) {
        const md5 = stdout.slice(stdout.length - 33, stdout.length - 1)
        resolve(md5.trim())
      })
    }
  })
}

function strcmp(a, b) {
  a = a.toString(), b = b.toString();
  for (var i=0,n=Math.max(a.length, b.length); i<n && a.charAt(i) === b.charAt(i); ++i);
  if (i === n) return 0;
  return a.charAt(i) > b.charAt(i) ? -1 : 1;
}

async function uploadAndSave({
  fileName,
  md5,
  r18Id,
  newName
}) {
  const k2sSaveResult = await axios({
    url: 'https://keep2share.cc/api/v2/createFileByHash',
    method: 'POST',
    data: JSON.stringify({
      access_token: host,
      hash: md5,
      name: newName,
      // parent: k2sTargetFolderId,
      access: "premium"
    })
  })
  const link = k2sSaveResult.data.link + '/' + newName
  const Extras = await Extra.findOne({
    where: {
      R18Id: r18Id
    }
  });
  const extra = Extras.extra ? JSON.parse(Extras.extra) : {};
  !extra.k2s && (extra.k2s = []);
  extra.k2s.push(link);
  extra.k2s.sort((a, b) => {
    return strcmp(b.split('/').pop(),a.split('/').pop());
  });
  await Extras.update({
    extra: JSON.stringify(extra)
  })
  await new Promise(resolve => {
    exec(`rm '${fileName}'`, function(error, stdout) {
      resolve(stdout)
    })
  })
}
async function appendOneTez({
  tezK2sId,
  r18Id,
  type,
  newName
}) {
  const fileName = await download({
    tezK2sId,
    type
  });
  await new Promise((resolve) => {
    setTimeout(resolve, 200)
  })
  const md5 = await getMD5(fileName)
  const save = await uploadAndSave({
    fileName,
    newName,
    md5,
    r18Id
  });
}

module.exports = appendOneTez;
