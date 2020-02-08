const { 
	getR18Paged,
	getMySelected,
	getCurrentClicks
} = require('../../sequelize/methods/index.js');
const { recentClickCreate } = require('../../sequelize/methods/recentClick.js');

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

	let rapidgator = !!ctx.path.match(/^\/rapidgator$/);

	let {
		zh
	} = ctx;
	let r18s = await getR18Paged({
		...ctx.query,
		pagesize: 20,
		rapidgator
	});

	let pageTitle,
		clickAction;
	if (actress_id) {
		pageTitle = zh ? ctx.actress.zh : ctx.actress.en;
		clickAction = {
			type: 'actress',
			clickId: actress_id
		};
	} else if (category_id) {
		pageTitle = zh ? ctx.category.zh : ctx.category.en;
		clickAction = {
			type: 'category',
			clickId: category_id
		};
	} else if (studio_id) {
		pageTitle = zh ? ctx.studio.zh : ctx.studio.en;
		clickAction = {
			type: 'studio',
			clickId: studio_id
		};
	} else if (series_id) {
		pageTitle = zh ? ctx.series.zh : ctx.series.en;
		clickAction = {
			type: 'series',
			clickId: series_id
		};
	} else if (lcode) { 
		pageTitle = lcode;
	} else if (rapidgator) {
		pageTitle = 'Rapidgator!';
	} else {
		pageTitle = zh ? '热度' : 'Popular';
	}

	if (clickAction && clickAction.clickId) {
		await recentClickCreate(clickAction)
	}
	let mySelected = await getMySelected();
	let currentClicks = await getCurrentClicks();

	ctx.body = ctx.dots.index({
		type: 'jvrList',
		pageTitle,
		r18s: r18s.rows || [],
		mySelected,
		currentClicks,
		pagination: generatePagination({
			baseUrl: ctx.request.url,
			current: page * 1,
			total: Math.ceil((r18s.count || 0) / 20)
		})
	});
	return;
}
