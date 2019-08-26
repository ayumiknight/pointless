const { R18Paged, R18SingleSimple } = require('../../sequelize/methods/r18.js');
const util = require('./util.js');

module.exports = async (ctx, next) => {
	let { ids } = ctx.query,
		decodedCodes = JSON.parse(ids).map( code => {
			return util.formatCode(code)
		});

	let r18s = await Promise.all(decodedCodes.map(code => {
		return  R18SingleSimple({
			code
		});
	}));

	ctx.body = JSON.stringify(r18s);

	return;

}
