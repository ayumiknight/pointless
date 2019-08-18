const { CategoryPaged } = require('../../sequelize/methods/categories.js');

module.exports = async (ctx, next) => {
	let { page = 1, letter = 'a' } = ctx.query;
	
	page = parseInt(page);
	letter = letter.toLowerCase();

	let categoryPaged = await CategoryPaged({
		firstLetter: letter,
		pageindex: page,
		pagesize: 20
	})

	ctx.body = ctx.dots.index({
		type: 'category',
		categories: categoryPaged
	});

	return;
}