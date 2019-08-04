const router = require('koa-router')();
const { R18Paged, R18Single } = require('../../sequelize/methods/r18.js');
const path = require('path');
const entries = require('./sampleData');
const {
	formatSingleEntryForRender
} = require('./util.js');




router.get('/jvr', async (ctx, next) => {
	let { id } = ctx.query;
	let r18 = await R18Single({
		id
	});
	console.log(r18, 'here is data')
	ctx.body = ctx.dots.index({
		single: true,
		r18: formatSingleEntryForRender(r18)
	});
	return;
});


router.get('/', async (ctx, next) => {
	let {pageindex} = ctx.query;
	let r18s = await R18Paged({
		page_index: 1,
		page_size: 20
	});
	

	ctx.body = ctx.dots.index({
		single: false,
		r18s
	});
	return;
});

module.exports = router;

