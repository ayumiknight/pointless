const { 
	getR18Paged, 
	getR18Single,
	recentClickCreate
} = require('../../sequelize/methods/index.js');

const {
	formatSingleEntryForRender,
	generatePagination,
	generateLetterPagination,
	searchTorrents
} = require('./util.js');

module.exports = async (ctx, next) => {

	let r18 = await getR18Single({
		code: ctx.query.id
	});

	let relatedQuery = {},
		relatedKeyword,
		reletedHref,
		relatedR18s = [];

	if (r18 && r18.code) {
		if (r18.Actresses && r18.Actresses.length === 1) {
			relatedQuery.actress_id = r18.Actresses[0].actress_id;
			relatedKeyword = r18.Actresses[0].en;
			reletedHref = `${ctx.zh ? '/zh' : ''}/cast?cast=${encodeURIComponent(relatedKeyword)}`
		} else if (r18.Series && r18.Series.series_id) {
			relatedQuery.series_id = r18.Series.series_id;
			relatedKeyword = r18.Series.en;
			reletedHref = `${ctx.zh ? '/zh' : ''}/series?series=${encodeURIComponent(relatedKeyword)}`
		} else if (r18.Studio && r18.Studio.studio_id) {
			relatedQuery.studio_id = r18.Studio.studio_id;
			relatedKeyword = r18.Studio.en;
			reletedHref = `${ctx.zh ? '/zh' : ''}/studio?studio=${encodeURIComponent(relatedKeyword)}`
		}
		if (Object.keys(relatedQuery).length) {
			relatedR18s = await getR18Paged({
				...ctx.query,
				pagesize: 10
			});
			relatedR18s = relatedR18s.rows;
		}
	}
	if (r18 && r18.id) {
		await recentClickCreate({
			type: 'jvr',
			clickId: r18.id,
			code: r18.code
		})
	}
	let title = r18 && r18.code ? ' - ' + (ctx.zh ? r18.zhTitle : r18.title): "- Not Found";
	ctx.body = ctx.dots.index({
		type: 'jvr',
		pageTitle: ctx.query.id + title.slice(0, 150),
		r18: r18 && r18.code && formatSingleEntryForRender(r18, ctx.zh),
		relatedR18s,
		relatedKeyword,
		reletedHref
	});
	return;
}
