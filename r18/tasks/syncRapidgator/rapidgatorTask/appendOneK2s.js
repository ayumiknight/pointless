const axios = require('axios');
const { _66, tezP, k2sVR, k2sNormal } = require('./k2sConfig');
const fs = require('fs');
const { exec } = require('child_process');

async function download(k2sId) {
  const res = await axios({
    url: 'https://keep2share.cc/api/v2/getUrl',
    method: 'POST',
    data: JSON.stringify({
      access_token: _66,
      file_id: k2sId
    })
  });
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
        console.log(stdout, '=============raw==stdout================')
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
  md5
}) {
  const newName = fileName.replace(/avcens\.xyz/i,'jvrlibrary').replace(/avcens/i, 'jvrlibrary');
  const k2sSaveResult = await axios({
    url: 'https://keep2share.cc/api/v2/createFileByHash',
    method: 'POST',
    data: JSON.stringify({
      access_token: _66,
      hash: md5,
      name: newName,
      // parent: k2sTargetFolderId,
      access: "premium"
    })
  })
  const link = k2sSaveResult.data.link + '/' + newName
  console.log(link, '===============final link=================')
  await new Promise(resolve => {
    exec(`rm '${fileName}'`, function(error, stdout) {
      resolve(stdout)
    })
  })
}
async function appendOneTez(k2sId) {
  const fileName = await download(k2sId);
  await new Promise((resolve) => {
    setTimeout(resolve, 200)
  })
  const md5 = await getMD5(fileName)
  const save = await uploadAndSave({
    fileName,
    md5
  });
}
const tasks = [
  '3a9fe11bcbc93',
  '5ba4abab31b47',
  '1958ac523ae2d',
  '70a4a35012ef4',
  'e3aad58acf90a'
]
async function main() {
  while(tasks.length) {
    const first = tasks.shift()
    try {
      await appendOneTez(first)
    } catch(e) {
      console.log(e)
    }
  }
}
main()
