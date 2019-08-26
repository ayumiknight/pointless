

const conditional = require('koa-conditional-get');
const etag = require('koa-etag');
const serve = require('koa-static');
const mount = require('koa-mount');
const Koa = require('koa');
const router = require('./router/index.js');
const { SyncDB, ActressesPagedByFirstLetter, getActressById, searchForActress } = require('../sequelize/methods/actresses.js');
const path = require('path');
const dots = require("dot").process({
	path: path.join(__dirname, "/templates")
});
const IO = require( 'koa-socket-2');
const io = new IO();
const RandomNames = require('./static/random-names'); //4946 entries
const cookie = require('cookie');

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


io.attach( app );

app._io.engine.generateId =  async function (req) {
    let cookies = cookie.parse(req.headers.cookie || '');
    if (cookies.key) {
    	return cookies.key;
    } else {
    	let random = Math.round(Math.random() * 5000),
    		randomActress = await getActressById(random),
    		timeStampNow = + new Date(),
    		avatar = randomActress.logo && randomActress.logo.split('/').pop();
    		
    	return Buffer.from(`${randomActress.en}|${avatar || ""}|${timeStampNow}`, 'binary').toString('base64');
    }
}



io.on('connection', (socket) => {

	let	roomName = socket.handshake.query.redirectTo;

	if (roomName) {
		socket.join(roomName);
	} else {
		socket.join('hall')
	}

	let authInfo = Buffer.from(socket.id, 'base64').toString().split('|');
	socket.emit('init', {
		name: authInfo[0],
		avatar: authInfo[1],
		count: socket.adapter.rooms[roomName || 'hall'].length
	})
	socket.on('message', (data) => {
		let date = + new Date();
		data.stamp = date;
		socket.broadcast.to(roomName).emit('message', data);
	});
})

async function bootServer() {
	await SyncDB();

	app.listen(8080, () => {
		console.log('+++++++++++++++r18 koa booted++++++++++++++')
	});
}

bootServer();
