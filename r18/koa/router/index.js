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
const userSearch = require('./userSearch.js')
router.use(async (ctx, next) => {
	let {  page = 1, code, id, cast, genre, studio, series, search, lcode} = ctx.query;

	//this block will be used to sanitize and filter allowed input
	ctx.query = {
		page,
		code,
		id,
		search,
		lcode
	};

	if (cast) {
		let actressList = await searchForActress(cast);	
		if (actressList.rows && actressList.rows[0])  {
			ctx.query.actress_id = actressList.rows[0].actress_id;
			ctx.actress = actressList.rows[0];
		}
	}
	if (genre) {
		let categoryList = await searchForCategory(genre);
		if (categoryList.rows && categoryList.rows[0])  {
			ctx.query.category_id = categoryList.rows[0].category_id
			ctx.category = categoryList.rows[0];
		}
	}
	if (studio) {
		let studioList = await searchForCategory(studio);

		if (studioList.rows && studioList.rows[0])  {
			ctx.query.studio_id = studioList.rows[0].studio_id;
			ctx.studio = studioList.rows[0];
		}
	}
	if (series) {
		let seriesList = await searchForSeries(series);
		if (seriesList.rows && seriesList.rows[0])  {
			ctx.query.series_id = seriesList.rows[0].series_id;
			ctx.series = seriesList.rows[0];
		}
	}

	return next();
})

router.get('/jvr', jvrSingle);
router.get('/actress', actressList);
router.get('/category', categoryList);
router.get('/search', userSearch);
router.get('/', jvrList);

module.exports = router;

