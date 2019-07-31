

const conditional = require('koa-conditional-get');
const etag = require('koa-etag');
const serve = require('koa-static');
const mount = require('koa-mount');
const Koa = require('koa');
const router = require('./router/test.js');
const { SyncDB } = require('../sequelize/methods/r18.js');

const app = new Koa();
app.use(conditional());
app.use(etag());
app.use(router.routes());


async function bootServer() {
	await SyncDB();

	app.listen(8080, () => {
		console.log('+++++++++++++++r18 koa booted++++++++++++++')
	});
}

bootServer();
