const fs = require('fs');
const axios = require('axios');
const url = require('url');
const fse = require('fs-extra');
const send = require('koa-send');

module.exports = async function(ctx, next) {
  if (ctx.path.match(/^\/static/i) && ctx.status === 404 && ctx.path.match(/^.+\.(jpg|png|jpeg)$/) && (ctx.method === 'GET' || ctx.method === 'HEAD')) {
    const remotePath = ctx.path.slice(7)
    console.log(remotePath, '=========remotePath==========')
    const res = await axios.get('https://pics.r18.com' + remotePath, {
      responseType: 'arraybuffer'
    })
    console.log(remotePath, '=========remotePath==========')
    if (res && res.data) {
      await fse.outputFileSync(__dirname + `/static${remotePath}`, res.data)
      try {
        const done = await send(ctx, `/static${remotePath}`, {
          maxAge: 1000 * 60 * 60 * 24
        })
      } catch(e) {
        if (e.status !== 404) {
          throw e
        }
      }       
    }
  } else {
    return next()
  }
}