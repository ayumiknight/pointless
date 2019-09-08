const { 
	getR18Paged,
	getR18PreNext
} = require('../../sequelize/methods/index.js');

const {
	formatSingleEntryForRender,
	generatePagination,
	generateLetterPagination,
	searchTorrents
} = require('./util.js');

module.exports = async (ctx, _next) => {

	let {code, pre, next} = ctx.query,
		[lcode, coden] = code.split('-');

	coden = (coden || '').match(/\d+/);

	if (!coden || !code) {
		ctx.body = "{}";
		return;
	}
	let [pre3, next3] = await Promise.all([
		!next ? getR18PreNext({
			lcode,
			isNext: false,
			coden
		}): Promise.resolve([]), 
		!pre ? getR18PreNext({
			lcode,
			isNext: true,
			coden
		}) : Promise.resolve([])
	]);

	pre3 = await Promise.all((pre3 || []).map( jvr => {
		return renderOneJvr(ctx, jvr);
	}));
	next3 = await Promise.all((next3 || []).map( jvr => {
		return renderOneJvr(ctx, jvr);
	}));
	ctx.body = JSON.stringify({
		pre: pre3,
		next: next3
	});
	return;
}

async function renderOneJvr(ctx, r18) {
	let relatedQuery = {},
		relatedKeyword,
		reletedHref,
		relatedR18s = [];
	
	if (r18 && r18.code) {
		if (r18.Actresses && r18.Actresses.length) {
			relatedQuery.actress_id = r18.Actresses[0].actress_id;
			relatedKeyword = r18.Actresses[0].en;
			reletedHref = `${ctx.zh ? '/zh' : ''}/cast?cast=${encodeURIComponent(relatedKeyword)}`
		}  else if (r18.Studio && r18.Studio.studio_id) {
			relatedQuery.studio_id = r18.Studio.studio_id;
			relatedKeyword = r18.Studio.en;
			reletedHref = `${ctx.zh ? '/zh' : ''}/studio?studio=${encodeURIComponent(relatedKeyword)}`
		}
		if (Object.keys(relatedQuery).length) {
			relatedR18s = await getR18Paged({
				...relatedQuery,
				pagesize: 10
			});
			relatedR18s = relatedR18s.rows;
		}
	} else {
		return '';
	}
	
	return ctx.dots.singleViewAjax({
		r18: r18 && r18.code && formatSingleEntryForRender(r18, ctx.zh),
		relatedR18s,
		relatedKeyword,
		reletedHref,
		lazy: true
	});
}
