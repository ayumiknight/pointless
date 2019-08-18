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
		series_id,
		lcode
	} = ctx.query;
		
	let r18s = await R18Paged({
		...ctx.query,
		pagesize: 20
	});

	let pageTitle;
	if (actress_id) {
		pageTitle = ctx.actress.en;
	} else if (category_id) {
		pageTitle = ctx.category.en;
	} else if (studio_id) {
		pageTitle = ctx.studio.en;
	} else if (series_id) {
		pageTitle = ctx.series.en;
	} else if (lcode) { 
		pageTitle = lcode;
	} else {
		pageTitle = 'Popular';
	}

	ctx.body = ctx.dots.index({
		type: 'jvrList',
		pageTitle,
		r18s: r18s.rows || [],
		pagination: generatePagination({
			baseUrl: ctx.request.url,
			current: page * 1,
			total: Math.ceil((r18s.count || 0) / 20)
		})
	});
	return;
}
