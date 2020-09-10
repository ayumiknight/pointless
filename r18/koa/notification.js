const webPush = require('web-push');
const router = require('koa-router')();
const { 
  updateUserEndpoint,
  sendNotification,
  getSubscriptionWithUser,
  getR18Paged,
  getNewRapidgator,
  checkSubscription,
  trackNotification
} = require('../sequelize/methods/index.js');
const schedule = require('node-schedule');

const keys = {
  publicKey: 'BDiq5Kbu-VbXF9ckNt12Ph5YPGiTqqY-vYEpHBIBR0yA1HbRzgjAdfJsB5nOgYlJT6UWc-hkImeqtF2RUjcPUHY',
  privateKey: 'c5virQ9v_IFp_CrO81EYBPWkq4IC1KS3_3N_WDaniAo'
}
webPush.setVapidDetails(
  'https://jvrlibrary.com',
  keys.publicKey,
  keys.privateKey
)

const  scheduleCronstyle = ()=>{
  //每分钟的第30秒定时执行一次:
  schedule.scheduleJob('30 * * * * *', ()=> {
    sendNotifications()
  }); 
}
scheduleCronstyle()

router.get('/notificationKey', function(ctx, next) {
  ctx.body = keys.publicKey
  return
})

router.post('/notificationCheck', async function(ctx, next) {
  if (!ctx.request.body || !ctx.request.body.subscription) return
  const res = await checkSubscription(ctx.request.body.subscription.endpoint)
  res && res.id ? ctx.ok() : ctx.error()
})
router.post('/notificationReg', async function(ctx, next) {
  if (!ctx.request.body || !ctx.request.body.subscription) return
  try {
    await updateUserEndpoint(ctx.request.body.subscription, ctx.user, true)
    ctx.ok(ctx.zh ? '订阅成功' : 'Subscribe Success')
  } catch(e) {
    ctx.error(ctx.zh ? '请稍候再试' : 'Something wrong, try again')
  }
})  
router.post('/notificationUnReg', async function(ctx, next) {
  if (!ctx.request.body || !ctx.request.body.subscription) return
  try {
    await updateUserEndpoint(ctx.request.body.subscription, ctx.user, false)
    ctx.ok(ctx.zh ? '取消订阅成功' : 'UnSubscribe Success')
  } catch(e) {
    ctx.error(ctx.zh ? '请稍候再试' : 'Something wrong, try again')
  }
})
router.get('/notificationTrack', async function(ctx, next) {
  const {
    endpoint
  } = ctx.query;
  await trackNotification(endpoint);
})
async function assemblePayload() {
  let {
		vr,
		nonvr
  } = await getNewRapidgator();
  if (vr * 1 < 2) return false
  let r18s = await getR18Paged({
		pagesize: 1,
		rapidgator: true,
		nonVR: false
  });
  let first = r18s.rows[0];
  
  return JSON.stringify({
    count: vr,
    thumb: first.fullCover.replace(/^https:\/\/pics.r18.com(.+)$/, "/static$1"),
    code: first.code,
    title: first.title,
    zhTitle: first.zhTitle
  })
}
async function sendNotifications() {
  const payload = await assemblePayload()
  if (!payload) return
  let hasMore = true,
    pagesize = 1,
    currentPage = 1;

  while(hasMore) {
    let rows = await getSubscriptionWithUser({
      pagesize,
      page: currentPage
    });
    console.log(rows);
    rows = rows.rows || [];
    
    hasMore = rows.length === pagesize;
    currentPage++;

    for(let i of rows) {
      const keys = i.keys.split('|');
      webPush.sendNotification({
        endpoint: i.endpoint,
        keys: {
          auth: keys[1],
          p256dh: keys[0]
        }
      }, payload, {
        TTL: 60 * 60 * 24
      }).catch(function(e) {
        console.log(e, i.endpoint, 'not sent')
      })
    }
  }
}
module.exports = router
