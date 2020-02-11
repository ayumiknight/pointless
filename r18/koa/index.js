const conditional = require('koa-conditional-get');
const etag = require('koa-etag');
const serve = require('koa-static');
const compose = require('koa-compose');
const mount = require('koa-mount');
const Koa = require('koa');
const router = require('./router/index.js');
const { 
	SyncDB,  
	getActressById,
	writeMessages,
	getRecentMessages,
	recentClickCreate,
	nodeCache
} = require('../sequelize/methods/index.js');

const path = require('path');
const dots = require("dot").process({
	path: path.join(__dirname, "/templates")
});
const IO = require( 'koa-socket-2');
const io = new IO();

const cookie = require('cookie');
const moment = require('moment');
const fs = require('fs');

const TorrentSearchApi = require('torrent-search-api');
TorrentSearchApi.enableProvider('Torrentz2');



function serveStatic() {
	const staticServer = new Koa();
	staticServer.use(serve(__dirname + '/static', {
		maxAge: 1000 * 60 * 60 * 24
	}));
	return mount('/static', staticServer);
}



const app = new Koa();

if (!process.env.dev && false) {
	io.attach(app, true, {
	  key: fs.readFileSync('../certs/jvrlibrary.key'),
	  cert: fs.readFileSync('../certs/Jvrlibrary_com.crt'),
	  ca: fs.readFileSync('../certs/Jvrlibrary_com.ca-bundle')
	});
} else {
	io.attach( app );
}



app.use(async (ctx, next) => {
	if (ctx.path.match(/^\/static/i)) {
		return next();
	} else {
		await compose([
			conditional(),
			etag()
		])(ctx, next);
	}
})
app.use(serveStatic());


app.use((ctx, next) => {
	let headers = ctx.request.header,
		isBot = (headers['user-agent'] || '').match(/(googlebot)/i),
		zh = ctx.path.match(/\/zh/i),
		path = ctx.path.replace(/\/zh/i, '') || '/',
		isBaidu = (headers['user-agent'] || '').match(/(baiduspider)/i);

	ctx.path = path;
	ctx.zh = zh;

	if (isBaidu) {
		ctx.body = "no crawl please";
		return;
	}
	ctx.dots = {
		index: (args) => {
			return dots.index({
				...args,
				zh,
				currentUrl: ctx.request.url,
				currentPath: path,
				isBot: !!isBot
			})
		},
		singleViewAjax: (args) => {
			return dots.singleViewAjax({
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

app.use(router.routes());




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

async function getTorrentByCode(code) {
	let	data = nodeCache.get('torrent:' + code);
	if (!data) {
		data = await TorrentSearchApi.search(code, 'All', 1);
		nodeCache.set('torrent:' + code, data);
	}
	return data;
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
		count: socket.adapter.rooms[roomName || 'hall'] ? socket.adapter.rooms[roomName || 'hall'].length : 1
	})
	
	socket.on('jvr', ({ code }) => {

		getTorrentByCode(code).then( torrents => {
			let torrent = torrents[0] || {},
				title = torrent.title,
				date = moment().toDate();
			
			let [letter, number ] = code.split('-');
			if (title && title.match(letter) && title.match(number)) {
				socket.emit('torrent', {
					code,
					magnet: torrent.magnet,
					title: torrent.title,
					createdAt: date,
					fromId: -1 ,
					time: torrent.time
				});
			}
		});
	})

	socket.on('torrentClicked', async (data) => {
		await recentClickCreate({
			type: 'torrent',
			code: data.code
		})
	})

	socket.on('rapidgatorClicked', async (data) => {
		await recentClickCreate({
			type: 'rapidgator',
			code: data.code
		})
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
