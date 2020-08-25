const fs = require('fs');
const axios = require('axios');
const url = require('url');
const fse = require('fs-extra');

module.exports = async function(ctx, next) {
  if (ctx.path.match(/^\/static/i) && ctx.status === 404 && ctx.path.match(/^.+\.(jpg|png|jpeg)$/)) {
    const remotePath = ctx.path.slice(7)
    const res = await axios.get('https://imuse-1300199822.cos.ap-beijing.myqcloud.com' +remotePath)
    if (res && res.data) {
      await fse.outputFileSync(__dirname + `/static${remotePath}`, res.data)
      ctx.body = res.data
      ctx.status = 200
    }
  }
}