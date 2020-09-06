const webPush = require('web-push');
const router = require('koa-router')();
const { 
  updateUserEndpoint,
  sendNotification,
  getSubscriptionWithUser,
  getR18Paged,
  getNewRapidgator,
  checkSubscription,
} = require('../sequelize/methods/index.js');
const schedule = require('node-schedule');

const keys = {
  publicKey: 'BMwbDvw4sAFo_C_7IwMI5NyRSNB__KukPqhfW05e-b0Bl3P-XnpvSffDAW2_LBLsKPv2HHfZDpz4M8_HMZdTsZY',
  privateKey: '1Lfu-ho562wkQ0ffSqosOzkn5_dI6ka155mUqdZ99Mg'
}
webPush.setVapidDetails(
  'http://localhost:3000',
  keys.publicKey,
  keys.privateKey
)

const  scheduleCronstyle = ()=>{
  //每分钟的第30秒定时执行一次:
  schedule.scheduleJob('30 * * * * *', ()=> {
    console.log('invoked time scheulde=========')
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

async function assemblePayload() {
  let {
		vr,
		nonvr
	} = await getNewRapidgator();
  let r18s = await getR18Paged({
		pagesize: 1,
		rapidgator: true,
		nonVR: false
  });
  let first = r18s.rows[0];
  return JSON.stringify({
    count: vr,
    thumb: first.fullCover,
    code: first.code,
    title: first.title,
    zhTitle: first.zhTitle
  })
}
async function sendNotifications() {
  const payload = await assemblePayload()
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
      }).catch(function(e) {
        console.log(e, i.endpoint, 'not sent')
      })
    }
  }
}
module.exports = router