

const conditional = require('koa-conditional-get');
const etag = require('koa-etag');
const serve = require('koa-static');
const mount = require('koa-mount');
const Koa = require('koa');
const router = require('./router/index.js');
const { SyncDB } = require('../sequelize/methods/r18.js');
const path = require('path');
const dots = require("dot").process({
	path: path.join(__dirname, "/templates")
});



function serveStatic() {
	const staticServer = new Koa();
	staticServer.use(conditional());
	staticServer.use(etag());
	staticServer.use(serve(__dirname + '/static'));
	return mount('/static', staticServer);
}


const app = new Koa();
app.use(conditional());
app.use(etag());
app.use((ctx, next) => {
	if (ctx.request.url.match('well-known')) {
		ctx.body = `092D3A508ACAA57B529F0F8D89DBE6366E38768BC68366E73EE44F8A2E3D003F
comodoca.com
ree86b00d8a8890829c`;
		return;
	}
	ctx.dots = {
		index: (args) => {
			return dots.index({
				...args,
				currentUrl: ctx.request.url,
				currentPath: ctx.request.path
			})
		}
	}
	return next();
})
app.use(serveStatic());
app.use(router.routes());


async function bootServer() {
	await SyncDB();

	app.listen(8080, () => {
		console.log('+++++++++++++++r18 koa booted++++++++++++++')
	});
}

bootServer();
