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

global.disablePost = false
global.currentBackgroundTask = ''
global.postLastRun = null
// const backgroundTask = async () => {
//   let hasFreshExtras = false;
//   let message = '';
//   while(true) {
//     if (global.disablePost) {
//       task = 'crawl'
//       message = 'backgroundTask:crawl disabledPost true==========='
//     } else if (hasFreshExtras) {
//       task = 'post'
//       message = 'backgroundTask:post hasFreshExtras true==========='
//     } else if (!global.postLastRun || ( + global.postLastRun + 3600000 <  + new Date())) {
//       task = 'post'
//       message = `backgroundTask:post global.postLastRun after 1 hour true=========== ${global.postLastRun} ${new Date()}`
//     } else {
//       task = 'crawl'
//       message = 'backgroundTask:crawl default task invoked=================='
//     }
//     console.log(message, moment().format('YYYY-MM-DD HH:mm:ss'), hasFreshExtras);
    
//     try {
//       if (task === 'crawl') {
//         global.currentBackgroundTask = 'crawl'
//         var newExtras = await crawl();
//         (newExtras > 0) && (hasFreshExtras = true)
//       } else {
//         global.currentBackgroundTask = 'post'
//         hasFreshExtras = false
//         global.postLastRun = new Date()
//         let Javlibrary = new javlibraryAutoTask({
//           // firefox: true
//         });
//         await Javlibrary.init();
//       }
//     } catch(e) {
//       console.log(e)
//     }
//   }
// }

const backgroundTask = async () => {
  global.currentBackgroundTask = 'crawl'
  while(true) {
    global.currentBackgroundTask = global.currentBackgroundTask === 'crawl' ? 'post' : 'crawl';
    try {
      if (global.currentBackgroundTask === 'crawl') {
        await crawl();
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
}

backgroundTask()
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
      moment(one.Extras.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      moment(one.lastPost).format('YYYY-MM-DD HH:mm:ss')
    ])
  })
  recentPosted.forEach(one => {
    table2.push([
      one.code,
      one.vr,
      moment(one.Extras.createdAt).format('YYYY-MM-DD HH:mm:ss'),
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
  console.log(lastLogs)
  ctx.body = ctx.dots.index({
		type: 'dash',
    tables: [table1, table2, table3, table4],
    currentBackgroundTask: global.currentBackgroundTask,
    disablePost: global.disablePost,
    lastLogs,
    postLastRun: moment(+ global.postLastRun).format('YYYY-MM-DD HH:mm:ss')
  });
  return

} 