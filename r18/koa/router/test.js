const router = require('koa-router')();
const { R18Paged, R18Single } = require('../../sequelize/methods/r18.js');
const path = require('path');
const entries = require('./sampleData');

router.get('/get', async (ctx, next) => {
	// let r18s = await R18Paged({
	// 	page_index: 1,
	// 	page_size: 10
	// });
	let {pageindex} = ctx.query;

	ctx.body = ctx.dots.index({
		single: false,
		r18s: entries.slice(0,10)
	});
	return;
});


router.get('/set', async (ctx, next) => {
	let { id } = ctx.query;
	// let r18 = await R18Single({
	// 	id
	// });

	ctx.body = ctx.dots.index({
		single: true,
		r18: entries[0]
	});
	return;
});

module.exports = router;
