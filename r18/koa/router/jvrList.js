const { R18Paged, R18Single } = require('../../sequelize/methods/r18.js');


const {
	formatSingleEntryForRender,
	generatePagination,
	generateLetterPagination
} = require('./util.js');

module.exports = async (ctx, next) => {
	let {
		page, 
		actress_id, 
		category_id, 
		studio_id, 
		series_id
	} = ctx.query;
		

	let r18s = await R18Paged({
		...ctx.query,
		pagesize: 20
	});

	ctx.body = ctx.dots.index({
		type: 'jvrList',
		r18s: r18s.rows,
		pagination: generatePagination({
			baseUrl: ctx.request.url,
			current: page,
			total: Math.ceil((r18s.count || 0) / 20)
		})
	});
	return;
}
