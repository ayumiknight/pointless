const conditional = require('koa-conditional-get');
const etag = require('koa-etag');
const serve = require('koa-static');
const Koa = require('koa');
const path = require('path');
const IO = require( 'koa-socket-2');
const io = new IO();

const staticServer = new Koa();
staticServer.use(conditional());
staticServer.use(etag());
staticServer.use(serve(__dirname + '/static'));
io.attach( staticServer );

io.use((ctx, next) => {
	let {
		event,
		data,
		socket,
		acknowledge
	} = ctx;
	
	socket.emit('news','dasadsad11')
})

io.on('my other event', (ctx, data) => {
  console.log('client sent data to message endpoint', data);
});
async function bootServer() {

	staticServer.listen(8080, () => {
		console.log('+++++++++++++++r18 chatroom++++++++++++++')
	});

}

bootServer();
