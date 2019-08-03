

const conditional = require('koa-conditional-get');
const etag = require('koa-etag');
const serve = require('koa-static');
const mount = require('koa-mount');
const Koa = require('koa');
const router = require('./router/test.js');
const { SyncDB } = require('../sequelize/methods/r18.js');
const path = require('path');
const dots = require("dot").process({
	path: path.join(__dirname, "/templates")
});



function serveStatic() {

	const staticServer = new Koa();
	staticServer.use(conditional());
	staticServer.use(etag());
	staticServer.use(serve('./static'));
	return mount('/static', staticServer);
}


const app = new Koa();
app.use(conditional());
app.use(etag());
app.use((ctx, next) => {
	ctx.dots = dots;
	return next();
})
app.use(serveStatic());
app.use(router.routes());


async function bootServer() {
	//await SyncDB();

	app.listen(8080, () => {
		console.log('+++++++++++++++r18 koa booted++++++++++++++')
	});
}

bootServer();
