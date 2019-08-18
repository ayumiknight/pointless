const { ActressesPagedByFirstLetter, searchForActress } = require('../../sequelize/methods/actresses.js');
const {
	formatSingleEntryForRender,
	generatePagination,
	generateLetterPagination
} = require('./util.js');

module.exports = async (ctx, next) => {
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
}
