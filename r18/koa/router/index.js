const router = require('koa-router')();
const { R18Paged, R18Single } = require('../../sequelize/methods/r18.js');
const { ActressesPagedByFirstLetter, searchForActress } = require('../../sequelize/methods/actresses.js');
const { searchForCategory } = require('../../sequelize/methods/categories.js');
const { searchForSeries } = require('../../sequelize/methods/series.js');
const { searchForStudio } = require('../../sequelize/methods/studios.js');

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
		let actress = await searchForActress(cast);	
		if (actress && actress.actress_id)  {
			ctx.query.actress_id = actress.actress_id;
			ctx.actress = actress;
		}
	}
	if (genre) {
		let category = await searchForCategory(genre);
		if (category && category.category_id)  {
			ctx.query.category_id = category.category_id;
			ctx.category = category
		}
	}
	if (studio) {
		let _studio = await searchForStudio(studio);
		if (_studio && _studio.studio_id)  {
			ctx.query.studio_id = _studio.studio_id;
			ctx.studio = _studio;
		}
	}
	if (series) {
		let _series = await searchForSeries(series);
		if (_series && _series.series_id)  {
			ctx.query.series_id = _series.series_id;
			ctx.series = _series;
		}
	}

	return next();
})

router.get('/jvr', jvrSingle);

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
router.get('/ranking', ranking);
router.get('/', jvrList);

module.exports = router;

