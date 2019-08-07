const conditional = require('koa-conditional-get');
const etag = require('koa-etag');
const serve = require('koa-static');
const mount = require('koa-mount');
const Koa = require('koa');
const router = require('./router');
const path = require('path');
const fs = require('fs');

//need to install php-xml on server



// client.getPost( 1114, function( error, post ) {
// 	console.log(error)
//     console.log(post);
// });

// client.getPostTypes( function(error, types) {
// 	console.log(error, types)
// })
// {
//   "title": "Calle Sarandi",
//   "description": "Sarandí Street is the principal pedestrian street of Ciudad Vieja in Montevideo, Uruguay and is the most frequented touristic place in the city.",
//   "panoid": "OnyTygRObM_hTLLdY4c5Vw",
//   "lat": "-34.907483",
//   "lng": "-56.204653",
//   "pitch": "-19.54",
//   "heading": "77.02",
//   "source": "https://es.wikipedia.org/wiki/Peatonal_Sarand%C3%AD"
// }

function serveStatic() {
	const staticServer = new Koa();
	staticServer.use(conditional());
	staticServer.use(etag());
	staticServer.use(serve(__dirname + '/static'));
	return mount('/static', staticServer);
}

const app = new Koa();
app.use(async (ctx, next) => {
	await next();
})
app.use(serveStatic())
app.use(router.routes());


async function bootServer() {

	app.listen(8080, () => {
		console.log('+++++++++++++++r18 koa booted++++++++++++++')
	});
}

bootServer();
