const { getRecentClicksFormatted } = require('../../sequelize/methods/recentClick.js');


module.exports = async (ctx, next) => {
	let days = parseInt(ctx.query.days || '') || 7;

	if (![1, 7, 30].includes(days)) days = 7;

	let nodeCache = ctx.nodeCache,
		ranking = nodeCache.get('ranking' + days);
	if (!ranking) {
		ranking = await getRecentClicksFormatted({
			days
		});
		nodeCache.set('ranking' + days, ranking);
	}
	

	let mapping = [{
		en: 'Top Videos',
		zh: '热门影片'
	},{
		en: 'Top Casts',
		zh: '热门女优'
	},{
		en: 'Top Genre',
		zh: '热门分类'
	},{
		en: 'Top Studios',
		zh: '热门发行商'
	}]

	ctx.body = ctx.dots.index({
		type: 'ranking',
		pageTitle: 'Ranking',
		columnMap: mapping,
		ranking: ranking,
		days
	});

	return;
}
