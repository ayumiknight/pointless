const {
	getR18Paged,
  getR18RecentPosted,
  sequelize
} = require('../../sequelize/methods/r18.js');
const {
  getUsers,
  getRecentSubscriptions
} = require('../../sequelize/methods/user.js');
const readLastLines = require('read-last-lines');
const moment = require('moment');

const javlibraryAutoTask = require('../../puppeteerAutoTask/javlibraryAutoPost');
const crawl = require('../../tasks/index.js');
const schedule = require('node-schedule');
const notification = require('../notification.js');
const appendOneTez = require('../../tasks/syncRapidgator/rapidgatorTask/appendOneTez');

const  scheduleCronstyle = ()=>{
  //每分钟的第30秒定时执行一次:
  schedule.scheduleJob('0 0 0,12 * * *', ()=> {
    console.log('schedule fired at', new Date())
    global.needSendNotifications = 1
  });
}
scheduleCronstyle()


global.disablePost = false
global.currentBackgroundTask = ''
global.postLastRun = null
global.allAxLastRun = null
global.otherTask = ''

const backgroundTask = async () => {
  global.currentBackgroundTask = 'post'
  while(true) {
    global.otherTask = ''
    if (global.needSendNotifications) {
      global.otherTask = 'notify'
      try {
        await notification.sendNotifications()
      } catch(e) {}
      global.needSendNotifications = null
    } else if (global.tezTasks && global.tezTasks.length) {
      global.otherTask = 'tezing'
      while(global.tezTasks.length) {
        const first = global.tezTasks.shift();
        try {
          await appendOneTez(first);
        } catch(e) {
          console.log(e, '==============tez Schedule error===========', first)
          if (e.message.match('Request failed with status code 406'))  {
            // await new Promise(resolve => {
            //   setTimeout(resolve, 1000 * 60 * 60 * 3 );
            // })
          }
        }
      }
    } else {
      global.currentBackgroundTask = global.currentBackgroundTask === 'crawl' ? 'post' : 'crawl';
      try {
        if (global.currentBackgroundTask === 'crawl') {
          let allAx
          if (global.allAxLastRun && (global.allAxLastRun * 1 + 60 * 60 * 1000 * 24 > new Date() * 1)) {
            allAx = false
          } else {
            allAx = global.allAxLastRun ? true : false
            global.allAxLastRun = new Date();
          }
          await crawl(false, allAx);
        } else {
          global.postLastRun = new Date()
          let Javlibrary = new javlibraryAutoTask({
            // firefox: true
          });
          await Javlibrary.init();
        }
      } catch(e) {
        console.log(e)
      }
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 1000 * 60 * 10)
    })
  }
}
if (!process.platform.match('win')) {
  backgroundTask()
}

module.exports = async (ctx, next) => {
  const {
    disablePost
  } = ctx.query

  if (disablePost) {
    global.disablePost = !!(disablePost * 1)
  }
  const [ recentExtras, recentPosted, users, subscriptions, lastLogs] = await Promise.all([
    getR18Paged({
      pagesize: 20,
      page: 1,
      javlibrary: true,
      both: true
    }),
    getR18RecentPosted({}),
    getUsers({}),
    getRecentSubscriptions({}),
    readLastLines.read('/root/.pm2/logs/index-out.log', 200).catch(e => { return '' })
  ])

  const table1 = [[
    'code', 'vr', 'createdAt', 'lastPost'
  ]]
  const table2 = [[
    'code', 'vr', 'createdAt', 'posted'
  ]]
  const table3 = [[
    'nick_name', 'avatar', 'key', 'createdAt'
  ]]
  const table4 = [[
    'id', 'nick_name', 'clickTimes', 'lastClicked'
  ]]
  recentExtras.rows.forEach(one => {
    table1.push([
      one.code,
      one.vr,
      moment(one.Extras && one.Extras.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      moment(one.lastPost).format('YYYY-MM-DD HH:mm:ss')
    ])
  })
  recentPosted.forEach(one => {
    table2.push([
      one.code,
      one.vr,
      moment(one.Extras && one.Extras.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      moment(one.updatedAt).format('YYYY-MM-DD HH:mm:ss')
    ])
  })
  users.forEach(one => {
    table3.push([
      one.nick_name,
      one.avatar,
      one.key,
      moment(one.createdAt).format('YYYY-MM-DD HH:mm:ss')
    ])
  })
  subscriptions.forEach(one => {
    table4.push([
      one.id,
      one.User && one.User.nick_name || ' ',
      one.clickTimes,
      one.lastClicked
    ])
  })
  // ctx.body = JSON.stringify([table1, table2])
  ctx.body = ctx.dots.index({
		type: 'dash',
    tables: [table1, table2, table3, table4],
    currentBackgroundTask: global.currentBackgroundTask,
    otherTask: global.otherTask,
    disablePost: global.disablePost,
    lastLogs,
    postLastRun: moment(+ global.postLastRun).format('YYYY-MM-DD HH:mm:ss')
  });
  return

} 
