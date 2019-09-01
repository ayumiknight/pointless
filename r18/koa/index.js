

const conditional = require('koa-conditional-get');
const etag = require('koa-etag');
const serve = require('koa-static');
const mount = require('koa-mount');
const Koa = require('koa');
const router = require('./router/index.js');
const { SyncDB, ActressesPagedByFirstLetter, getActressById, searchForActress } = require('../sequelize/methods/actresses.js');
const { writeMessages, getRecentMessages } = require('../sequelize/methods/messages.js');
const path = require('path');
const dots = require("dot").process({
	path: path.join(__dirname, "/templates")
});
const IO = require( 'koa-socket-2');
const io = new IO();
const RandomNames = require('./static/random-names'); //4946 entries
const cookie = require('cookie');
const moment = require('moment');
const fs = require('fs');
const NodeCache = require('node-cache');

const nodeCache = new NodeCache({ 
	stdTTL: 60 * 180, 
	checkperiod: 120
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
	let headers = ctx.request.header,
		isBot = (headers['user-agent'] || '').match(/(googlebot)/i),
		zh = ctx.path.match(/\/zh/i),
		path = ctx.path.replace(/\/zh/i, '') || '/';

	ctx.path = path;
	ctx.zh = zh;
	ctx.nodeCache = nodeCache;

	ctx.dots = {
		index: (args) => {
			return dots.index({
				...args,
				zh,
				currentUrl: ctx.request.url,
				currentPath: path,
				isBot: !!isBot
			})
		}
	}
	return next();
})
app.use(serveStatic());
app.use(router.routes());

if (!process.env.dev && false) {
	io.attach(app, true, {
	  key: fs.readFileSync('../certs/jvrlibrary.key'),
	  cert: fs.readFileSync('../certs/Jvrlibrary_com.crt'),
	  ca: fs.readFileSync('../certs/Jvrlibrary_com.ca-bundle')
	});
} else {
	io.attach( app );
}


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



io.on('connection', async (socket) => {
	let	roomName = socket.handshake.query.redirectTo;

	if (roomName) {
		socket.join(roomName);
	} else {
		socket.join('hall');
	}

	let authInfo = Buffer.from(socket.id, 'base64').toString().split('|');
	
	let messages = await getRecentMessages({
		mins: 60 * 24
	});

	socket.emit('message', messages.rows || []);

	socket.emit('init', {
		name: authInfo[0],
		avatar: authInfo[1],
		count: socket.adapter.rooms[roomName || 'hall'].length
	})


	socket.on('message', async (data) => {
		let date = moment().toDate();

		await writeMessages(data);

		data.forEach( message  => {
			message.createdAt = date;
		})
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
