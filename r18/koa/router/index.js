const router = require('koa-router')();
const { 
	getSearchForActress, 
	getSearchForCategory,
	getSearchForSeries,
	getSearchForStudio
} = require('../../sequelize/methods/index.js');


const path = require('path');
const entries = require('./sampleData');
const {
	formatSingleEntryForRender,
	generatePagination,
	generateLetterPagination
} = require('./util.js');
const jvrList = require('./jvrList.js');
const jvrSingle = require('./jvrSingle.js');
const actressList = require('./actressList.js');
const categoryList = require('./categoryList.js');
const studio = require('./studioList.js');
const userSearch = require('./userSearch.js');
const chatSearch = require('./chatSearch.js');
const ranking = require('./ranking.js');
const preAndNext = require('./preAndNext');
const sitemap = require('./sitemap.js');

router.use(async (ctx, next) => {
	let {  page = 1, code, id, cast, genre, studio, series, search, lcode} = ctx.query;

	//this block will be used to sanitize and filter allowed input
	// ctx.query = {
	// 	page,
	// 	code,
	// 	id,
	// 	search,
	// 	lcode
	// };

	ctx.query.page = page;

	if (cast) {
		let actress = await getSearchForActress(cast);	
		if (actress && actress.actress_id)  {
			ctx.query.actress_id = actress.actress_id;
			ctx.actress = actress;
		}
	}
	if (genre) {
		let category = await getSearchForCategory(genre);
		if (category && category.category_id)  {
			ctx.query.category_id = category.category_id;
			ctx.category = category
		}
	}
	if (studio) {
		let _studio = await getSearchForStudio(studio);
		if (_studio && _studio.studio_id)  {
			ctx.query.studio_id = _studio.studio_id;
			ctx.studio = _studio;
		}
	}
	if (series) {
		let _series = await getSearchForSeries(series);
		if (_series && _series.series_id)  {
			ctx.query.series_id = _series.series_id;
			ctx.series = _series;
		}
	}

	return next();
})

router.get('/jvr', jvrSingle);
router.get('/preAndNext', preAndNext);
router.get('/casts', actressList);
router.get('/categories', categoryList);
router.get('/studios', studio);

router.get('/search', userSearch);
router.get('/chatSearch', chatSearch);

router.get('/cast', jvrList);
router.get('/genre', jvrList);
router.get('/studio', jvrList);
router.get('/series', jvrList);
router.get('/lcode', jvrList);
router.get('/rapidgator', jvrList);
router.get('/ranking', ranking);
router.get(/^\/sitemap(.*)?/, sitemap);
router.get('/', jvrList);

module.exports = router;

