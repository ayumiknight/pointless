const { getCategoryPaged } = require('../../sequelize/methods/index.js');

module.exports = async (ctx, next) => {

	categoryPaged = await getCategoryPaged({
		zh: ctx.zh
	});
	
	ctx.body = ctx.dots.index({
		type: 'category',
		pageTitle: ctx.zh ? '类别' : 'Genre',
		categories: categoryPaged
	});

	return;
}
