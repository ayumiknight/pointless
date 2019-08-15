const router = require('koa-router')();
const { R18Paged, R18Single } = require('../../sequelize/methods/r18.js');
const path = require('path');
const entries = require('./sampleData');
const {
	formatSingleEntryForRender,
	generatePagination
} = require('./util.js');



router.get('/jvr', async (ctx, next) => {
	let { id } = ctx.query;
	let r18 = await R18Single({
		id
	});
	console.log(r18, 'here is data')
	ctx.body = ctx.dots.index({
		type: 'jvrList',
		r18: formatSingleEntryForRender(r18)
	});
	return;
});


router.get('/actress', async (ctx, next) => {
	let {pageindex} = ctx.query;
	let r18s = await R18Paged({
		page_index: 1,
		page_size: 20
	});
	

	ctx.body = ctx.dots.index({
		type: 'jvrList',
		r18s
	});
	return;
});


router.get('/', async (ctx, next) => {
	let {page} = ctx.query;
	// let r18s = await R18Paged({
	// 	page_index: 1,
	// 	page_size: 20
	// });
	let r18s = entries,
		current = page * 1 || 1;
	r18s = r18s.slice((page -1) * 20, page * 20 );

	ctx.body = ctx.dots.index({
		type: 'jvr',
		r18s,
		pagination: generatePagination({
			baseUrl: '/',
			current,
			total: 6
		})
	});
	return;
});

module.exports = router;

