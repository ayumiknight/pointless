const conditional = require('koa-conditional-get');
const etag = require('koa-etag');
const serve = require('koa-static');
const compose = require('koa-compose');
const mount = require('koa-mount');
const Koa = require('koa');
const router = require('./router/index.js');
const notificationRouter = require('./notification.js');
const ImageDownloadService = require('./imageDownloadAndService.js');
const bodyParser = require('koa-bodyparser')
const Auth = require('./auth.js');
const Cookies = require('cookies');
const { 
	SyncDB,  
	getActressById,
	writeMessages,
	getRecentMessages,
	recentClickCreate,
	nodeCache,
	tagR18sWithTorrent
} = require('../sequelize/methods/index.js');

const path = require('path');
const axios = require('axios');
const dots = require("dot").process({
	path: path.join(__dirname, "/templates")
});
const IO = require( 'koa-socket-2');
const io = new IO();

const cookie = require('cookie');
const moment = require('moment');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'dev';

function serveStatic() {
	const staticServer = new Koa();
	staticServer.use(serve(__dirname + '/static', {
		maxAge: 1000 * 60 * 60 * 24
	}));
	return mount('/static', staticServer);
}

const webpack = require('webpack');
const config = require('../webpack.js');
const koaWebpack = require('koa-webpack');
const compiler = webpack(config);

const app = new Koa();
// keys used by keygrip for sign the cookie
app.keys = ['i love jvrlibrary', 'you like jvrlibrary', 'we like jvrlibrary']

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
app.use(ImageDownloadService);
app.use(bodyParser())
app.use((ctx, next) => {
	let headers = ctx.request.header,
		isBot = (headers['user-agent'] || '').match(/(googlebot)/i),
		zh = ctx.path.match(/\/zh/i),
		path = ctx.path.replace(/\/zh/i, '') || '/',
		isBaidu = (headers['user-agent'] || '').match(/(baiduspider)/i);
	
	ctx.path = path;
	ctx.zh = zh;
	ctx.nonVR = !!ctx.cookies.get('nonVR');
	
	// if (isBaidu) {
	// 	ctx.body = "no crawl please";
	// 	return;
	// }

	ctx.ok = (data = {}, message = 'success') => {
		ctx.status = 200;
		ctx.body = JSON.stringify({
			status: 200,
			message,
			data
		})
	}
	ctx.error = (message = 'fail') => {
		ctx.status = 200;
		ctx.body = JSON.stringify({
			status: 500,
			message
		})
	}
	ctx.dots = {
		index: (args) => {
			return dots.index({
				...args,
				zh,
				currentUrl: ctx.request.url,
				currentPath: path,
				isBot: !!isBot,
				nonVR: ctx.nonVR
			})
		},
		vrplayer: (args) => {
			return dots.vrplayer({
				...args,
				zh,
				currentUrl: ctx.request.url,
				currentPath: path,
				isBot: !!isBot,
				nonVR: ctx.nonVR
			})
		}
	}
	return next();
})

app.use(Auth);
app.use(mount('/api', notificationRouter.routes()))


app._io.engine.generateId =  async function (req) {
	const auth = new Cookies(req, {}, {
		keys: ['i love jvrlibrary', 'you like jvrlibrary', 'we like jvrlibrary']
	}).get('user', {
		signed: true
	})
	return auth;
}

// async function getTorrentByCode(code) {
// 	let response = await axios.get(`http://localhost:8001/torrent?code=${code}`);
// 	return response.data || {};
// }

io.on('connection', async (socket) => {
	let	roomName = socket.handshake.query.redirectTo;
	let error = false
	let user_id,
		nick_name,
		avatar;
	try {
		if (roomName) {
			socket.join(roomName);
		} else {
			socket.join('hall');
		}
		[user_id, nick_name, avatar] = Buffer.from(socket.id, 'base64').toString().split('|');
	} catch(e) {
		error = true
	}
	if (error) return

	let messages = await getRecentMessages({
		mins: 60 * 24
	});

	socket.emit('message', messages.rows || []);

	socket.emit('init', {
		name: nick_name,
		avatar: avatar,
		count: socket.adapter.rooms[roomName || 'hall'] ? socket.adapter.rooms[roomName || 'hall'].length : 1
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
	// await SyncDB();
	if (isDev) {
		const koaDevServer = await koaWebpack({ 
			compiler,
			devMiddleware: {
				serverSideRender: true
			}
		});
		
		app.use(koaDevServer)
	}
	app.use(router.routes());

	app.listen(8080, () => {
		console.log('+++++++++++++++r18 koa booted++++++++++++++')
	});
}

bootServer();
