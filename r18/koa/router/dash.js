const {
	getR18Paged,
	getR18RecentPosted
} = require('../../sequelize/methods/r18.js');
const {
  getUsers,
  getRecentSubscriptions
} = require('../../sequelize/methods/user.js');

const moment = require('moment');
module.exports = async (ctx, next) => {
  
  const [ recentExtras, recentPosted, users, subscriptions ] = await Promise.all([
    getR18Paged({
      pagesize: 20,
      page: 1,
      javlibrary: true,
      both: true
    }),
    getR18RecentPosted({}),
    getUsers({}),
    getRecentSubscriptions({})
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
    console.log(JSON.stringify(one))
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
		tables: [table1, table2, table3, table4]
  });
  return

} 