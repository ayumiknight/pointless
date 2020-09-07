const { 
  login,
  register,
  oneUser
} = require('../sequelize/methods/index.js');
const md5 = require('md5');
const multer = require('@koa/multer');
const util = require('./util');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './koa/static/r18User/')
  },
  filename: function (req, file, cb) {
    const {
      originalname,
      mimetype
    } = file;
    const extension = util.getExtension({
      originalname,
      mimetype,
      defaults: 'jpg'
    })
    cb(null, (new Date() * 1) + originalname)
  }
})

const upload = multer({
  storage,
  limits: {
    files: 1,
    fileSize: 1000 * 5000
  },
  fileFilter (req, file, cb) {
    const {
      originalname,
      mimetype
    } = file;
    const extension = util.getExtension({
      originalname,
      mimetype,
      defaults: ''
    })
    const ok = ['jpg', 'jpeg', 'png', 'gif', 'jfif', 'bmp'].includes(extension)
    cb(null, ok)
  }
});



const month = 1000 * 60 * 60 * 24 * 30;

module.exports = async function(ctx, next) {
  
  const user = ctx.cookies.get('user', {
    signed: true
  })
  if (user) {
    const [user_id, nick_name, avatar] = Buffer.from(user, 'base64').toString().split('|');

    ctx.user = {
      user_id,
      nick_name,
      avatar
    }
    const userVerified = await oneUser({
      user_id
    })
    if (!userVerified || !userVerified.id) {
      ctx.cookies.set('user', '', {
        signed: true,
        maxAge: month
      });
      ctx.user = null;
    }
  }

  if (ctx.method === 'GET' && ctx.path === '/api/getUser') {
    ctx.ok(ctx.user || {})
    return
  }

  await new Promise(( resolve, reject) => {
    try {
      upload.single('avatar')(ctx, resolve)
    } catch(e) {
      console.log('message')
    }
  })


  if (ctx.method === 'POST' && ctx.path === '/api/login') {
    const {
      key,
      secret
    } = ctx.request.body;

    const validKey = /^[a-zA-Z0-9_.]+@[a-zA-Z0-9_.]+(\.[a-zA-Z]{2,5}){1,2}$/.test(key)
    if (!validKey) {
      ctx.error(ctx.zh ? '请检查邮箱' : 'Please enter a valid email')
      return
    }
    const user = await login({
      key,
      secret
    })
    if (user && user.id) {
      ctx.user = {
        ...user,
        user_id: user.id
      }
      const cookieFragments = [user.id, user.nick_name, user.avatar];
      ctx.cookies.set('user', Buffer.from(cookieFragments.join('|')).toString('base64'), {
        signed: true,
        maxAge: month
      });
      ctx.ok(ctx.zh ? '登录成功' : 'Login Success')
    } else {
      ctx.error(ctx.zh ? '该邮箱未注册' : 'This email is not registered')
    }
    return
  }

  if (ctx.method === 'POST' && ctx.path === '/api/register') {
    
    const {
      key,
      secret,
      nick_name
    } = ctx.request.body;

    const validKey = /^[a-zA-Z0-9_.]+@[a-zA-Z0-9_.]+(\.[a-zA-Z]{2,5}){1,2}$/.test(key)
    if (!validKey) {
      ctx.error(ctx.zh ? '请检查邮箱' : 'Please enter a valid email')
      return
    }

    let avatar = ''
    if (ctx.file && ctx.file.filename) {
      avatar = '/static/r18User/' + ctx.file.filename;
    }
    
    try {
      const user = await register({
        key,
        secret,
        avatar,
        nick_name
      })
      if (user && user.id) {
        ctx.user = {
          ...user,
          user_id: user.id
        }
        const cookieFragments = [user.id, user.nick_name, user.avatar];
        ctx.cookies.set('user', Buffer.from(cookieFragments.join('|')).toString('base64'), {
          signed: true,
          maxAge: month
        });
        ctx.ok(ctx.zh ? '注册成功' : 'Register Success')
      }
    } catch(e) {
      if (e.message == 1) {
        ctx.error(ctx.zh ? '该邮箱已注册' : 'Email already registered, try login')
      } else {
        ctx.error(ctx.zh ? '昵称已被占用' : 'NickName already registered, try another one')
      }
    }
    return
  }
  if (ctx.method === 'POST' && ctx.path === '/api/logout') {
    ctx.cookies.set('user', '', {
      signed: true,
      maxAge: month
    });
    ctx.ok(ctx.zh ? '登出成功' : 'Logout Success.')
    return
  }

  return next()
}