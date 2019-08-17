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

router.use(async (ctx, next) => {
	let {  page = 1, code, id, cast, genre, studio, series } = ctx.query;

	//clean
	ctx.query = {
		page,
		code,
		id
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
			ctx.category = studioList.rows[0];
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


router.get('/actress', async (ctx, next) => {
	let { page = 1, letter = 'a' } = ctx.query;
	
	page = parseInt(page);
	letter = letter.toLowerCase();

	let actressesPaged = await ActressesPagedByFirstLetter({
		firstLetter: letter,
		pageindex: page,
		pagesize: 20
	})

	ctx.body = ctx.dots.index({
		type: 'actress',
		actresses: actressesPaged.rows,
		letterPagination: generateLetterPagination({
			baseUrl: ctx.request.url,
			current: letter
		}),
		pagination: generatePagination({
			baseUrl: ctx.request.url,
			current: page,
			total: Math.ceil((actressesPaged.count || 0) / 20)
		})
	});

	return;
});


router.get('/', jvrList);

module.exports = router;

