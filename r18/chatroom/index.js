const conditional = require('koa-conditional-get');
const etag = require('koa-etag');
const serve = require('koa-static');
const Koa = require('koa');
const path = require('path');
const IO = require( 'koa-socket-2');
const io = new IO();
const RandomNames = require('./static/random-names'); //4946 entries
const staticServer = new Koa({

});
const cookie = require('cookie');

staticServer.use(conditional());
staticServer.use(etag());
staticServer.use(serve(__dirname + '/static'));
io.attach( staticServer );


staticServer._io.engine.generateId = function (req) {
    let cookies = cookie.parse(req.headers.cookie || '');
    if (cookies.key) {
    	return cookies.key;
    } else {
    	let random = Math.round(Math.random() * 4946),
    		randomName = RandomNames[random],
    		timeStampNow = + new Date();

    	return Buffer.from(randomName + '|' + timeStampNow, 'binary').toString('base64');
    }
}



io.on('connection', (socket) => {
	let	cookies = cookie.parse(socket.handshake.headers['cookie'] || ''),
		roomName = socket.handshake.query.redirectTo;
	if (roomName) {
		socket.join(roomName);
	} else {
		socket.join('hall')
	}


	let name = Buffer.from(cookies['io'], 'base64').toString().split('|')[0];
	socket.emit('init', {
		name,
		count: socket.adapter.rooms[roomName || 'hall'].length
	})
})

async function bootServer() {

	staticServer.listen(8080, () => {

	});

}

bootServer();
