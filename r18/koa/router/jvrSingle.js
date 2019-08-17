const { R18Paged, R18Single } = require('../../sequelize/methods/r18.js');
const { searchForActress } = require('../../sequelize/methods/actresses.js');
const {
	formatSingleEntryForRender,
	generatePagination,
	generateLetterPagination
} = require('./util.js');

module.exports = async (ctx, next) => {

	let r18 = await R18Single({
		code: ctx.query.id
	});

	ctx.body = ctx.dots.index({
		type: 'jvr',
		r18: formatSingleEntryForRender(r18)
	});
	return;
}
