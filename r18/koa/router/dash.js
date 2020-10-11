const {
	getR18Paged,
	getR18RecentPosted
} = require('../../sequelize/methods/r18.js');
const moment = require('moment');
module.exports = async (ctx, next) => {
  
  const [ recentExtras, recentPosted ] = await Promise.all([
    getR18Paged({
      pagesize: 20,
      page: 1,
      javlibrary: true,
      both: true
    }),
    getR18RecentPosted({})
  ])

  const table1 = [[
    'code', 'vr', 'createdAt', 'lastPost'
  ]]
  const table2 = [[
    'code', 'vr', 'posted'
  ]]
  console.log(recentExtras, recentPosted, '=========')
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
      moment(one.updatedAt).format('YYYY-MM-DD HH:mm:ss')
    ])
  })
  // ctx.body = JSON.stringify([table1, table2])
  ctx.body = ctx.dots.index({
		type: 'dash',
		tables: [table1, table2]
  });
  return

} 