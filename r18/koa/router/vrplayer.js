const fs = require('fs');

module.exports = async (ctx, next) => {
	let fileName = fs.readdirSync('./static').find(one => {
		return one.split('.').pop() === 'mp4';
	});

	ctx.body = ctx.dots.vrplayer({
		fileName: fileName
	});

	return;
}
