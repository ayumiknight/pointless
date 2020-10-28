const fs = require('fs');
const axios = require('axios');
const url = require('url');
const fse = require('fs-extra');
const send = require('koa-send');

module.exports = async function(ctx, next) {
  if (ctx.path.match(/^\/static/i) && ctx.status === 404 && ctx.path.match(/^.+\.(jpg|png|jpeg|gif)$/) && (ctx.method === 'GET' || ctx.method === 'HEAD')) {
    const remotePath = ctx.path.slice(7)
    // https://imuse-1300199822.cos.ap-beijing.myqcloud.com/img/70e64d5b609f0831c22658aef771b854.jpeg
    const res = await axios.get('https://pics.r18.com' + remotePath, {
      responseType: 'arraybuffer'
    })
    if (res && res.data) {
      await fse.outputFileSync(__dirname + `/static${remotePath}`, res.data)
      try {
        const done = await send(ctx, `/koa/static${remotePath}`, {
          maxAge: 1000 * 60 * 60 * 1,
          gzip: true
        })
      } catch(e) {
        if (e.status !== 404) {
          throw e
        }
      }       
    }
  } else if (ctx.path === '/service.js' && ctx.method === 'GET') {
    await send(ctx, `/koa/static/service.js`, {
      maxAge: 1000 * 60 * 60 * 1,
      gzip: true
    })
  } else {
    return next()
  }
}