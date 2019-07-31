const router = require('koa-router')();
const { R18Paged, R18Single } = require('../../sequelize/methods/r18.js');

router.get('/get', async (ctx, next) => {
	ctx.body = 'hello';
	return;
});


router.get('/set', async (ctx, next) => {
	let { id } = ctx.query;
	let r18 = await R18Single({
		id
	});
	console.log(r18, 'r18here==============')
	ctx.body = r18;
	return;
});

module.exports = router;
