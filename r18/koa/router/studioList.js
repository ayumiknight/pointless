const { StudiosPagedByFirstLetter } = require('../../sequelize/methods/studios.js');
const {
	formatSingleEntryForRender,
	generatePagination,
	generateLetterPagination
} = require('./util.js');

module.exports = async (ctx, next) => {
	let { page = 1, letter = 'a' } = ctx.query;
	
	page = parseInt(page);
	letter = letter.toLowerCase();

	let studiosPaged = await StudiosPagedByFirstLetter({
		firstLetter: letter,
		pageindex: page,
		pagesize: 20
	});

	ctx.body = ctx.dots.index({
		type: 'studio',
		studios: studiosPaged.rows,
		pageTitle: ctx.zh ? '发行商' : 'Studios',
		letterPagination: generateLetterPagination({
			baseUrl: ctx.request.url,
			current: letter
		}),
		pagination: generatePagination({
			baseUrl: ctx.request.url,
			current: page,
			total: Math.ceil((studiosPaged.count || 0) / 20)
		})
	});


	return;
}
