const { getR18SingleSimple } = require('../../sequelize/methods/index.js');
const util = require('./util.js');

module.exports = async (ctx, next) => {
	let { ids } = ctx.query,
		decodedCodes = JSON.parse(ids).map( code => {
			return util.formatCode(code)
		});

	let r18s = await Promise.all(decodedCodes.map(code => {
		return  getR18SingleSimple({
			code
		});
	}));

	ctx.body = JSON.stringify(r18s);

	return;

}
