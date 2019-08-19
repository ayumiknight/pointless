const { R18Paged, R18Single } = require('../../sequelize/methods/r18.js');
const { searchForActress } = require('../../sequelize/methods/actresses.js');
const {
	formatSingleEntryForRender,
	generatePagination,
	generateLetterPagination
} = require('./util.js');

module.exports = async (ctx, next) => {

	let r18 = await R18Single({
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
			reletedHref = `/cast?cast=${encodeURIComponent(relatedKeyword)}`
		} else if (r18.Series && r18.Series.series_id) {
			relatedQuery.series_id = r18.Series.series_id;
			relatedKeyword = r18.Series.en;
			reletedHref = `/series?series=${encodeURIComponent(relatedKeyword)}`
		} else if (r18.Studio && r18.Studio.studio_id) {
			relatedQuery.studio_id = r18.Studio.studio_id;
			relatedKeyword = r18.Studio.en;
			reletedHref = `/studio?studio=${encodeURIComponent(relatedKeyword)}`
		}
		if (Object.keys(relatedQuery).length) {
			relatedR18s = await R18Paged({
				...ctx.query,
				pagesize: 20
			});
			relatedR18s = relatedR18s.rows;
		}
	}

	ctx.body = ctx.dots.index({
		type: 'jvr',
		pageTitle: ctx.query.id,
		r18: r18 && r18.code && formatSingleEntryForRender(r18),
		relatedR18s,
		relatedKeyword,
		reletedHref
	});
	return;
}
