var router = require('koa-router')();
var models = require('../sequelize/index');

router.get('/get', async (ctx, next) => {
	console.log('hit==============get')
	ctx.body = await models.Point.findAll();
	return;
});


router.get('/set', async (ctx, next) => {
	console.log('hit==============set')
	await models.Point.create(ctx.query);
	return;
});

module.exports = router;
