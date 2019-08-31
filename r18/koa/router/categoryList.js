const { CategoryPaged } = require('../../sequelize/methods/categories.js');

module.exports = async (ctx, next) => {

	let nodeCache = ctx.nodeCache,
		categoryPaged = nodeCache.get('categories' + (ctx.zh ? 'zh' : ''));
	if (!categoryPaged) {
		categoryPaged = await CategoryPaged({
			zh: ctx.zh
		});
		nodeCache.set('categories' + (ctx.zh ? 'zh' : ''), categoryPaged);
	}

	ctx.body = ctx.dots.index({
		type: 'category',
		pageTitle: ctx.zh ? '类别' : 'Genre',
		categories: categoryPaged
	});

	return;
}
