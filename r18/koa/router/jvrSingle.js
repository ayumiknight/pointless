const { 
	getR18Paged, 
	getR18Single,
	recentClickCreate,
	getR18PreNext
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

	if (ctx.query.raw) {
		ctx.body = JSON.stringify(r18);
		return;
	}
	let relatedQuery = {},
		relatedKeyword,
		reletedHref,
		relatedR18s = [];

	if (r18 && r18.code) {
		if (r18.Actresses && r18.Actresses.length) {
			relatedQuery.actress_id = r18.Actresses[0].actress_id;
			relatedKeyword = r18.Actresses[0].en;
			reletedHref = `${ctx.zh ? '/zh' : ''}/cast?cast=${encodeURIComponent(relatedKeyword)}`
		} else if (r18.Studio && r18.Studio.studio_id) {
			relatedQuery.studio_id = r18.Studio.studio_id;
			relatedKeyword = r18.Studio.en;
			reletedHref = `${ctx.zh ? '/zh' : ''}/studio?studio=${encodeURIComponent(relatedKeyword)}`
		} else if (r18.Series && r18.Series.series_id) {
			relatedQuery.series_id = r18.Series.series_id;
			relatedKeyword = r18.Series.en;
			reletedHref = `${ctx.zh ? '/zh' : ''}/series?series=${encodeURIComponent(relatedKeyword)}`
		}

		//related 5 items
		if (Object.keys(relatedQuery).length) {

			relatedR18s = await getR18Paged({
				...relatedQuery,
				pagesize: 5,
				nonVR: ctx.nonVR
			});
			relatedR18s = relatedR18s.rows;
		}

		if (r18.Extras) {
			let extras = JSON.parse(r18.Extras.extra);
			r18.rapidgator = extras.rapidgator;
			r18.pixhost = extras.pixhost;
		}

		//items in same series
		let [pre, next] = await Promise.all([
			getR18PreNext({
				lcode: r18.code.split('-')[0],
				isNext: false,
				coden: r18.coden
			}), 
			getR18PreNext({
				lcode: r18.code.split('-')[0],
				isNext: true,
				coden: r18.coden
			})
		]);
		if (pre && pre[0] && pre[0].code) {
			r18.previous = pre[0].code;
		}
		if (next && next[0] && next[0].code) {
			r18.next = next[0].code;
		}
	}

	if (r18 && r18.id) {
		await recentClickCreate({
			type: 'jvr',
			clickId: r18.id,
			code: r18.code,
			vr: r18.vr
		})
	}
	let title = 'Not Found',
		keywords = '';

	if (r18 && r18.code) {
		title = ' ' + r18.code + ' - ' + 'Rapidgator And Torrent Online Streaming And Download - ' + (ctx.zh ? r18.zhTitle : r18.title); 
		keywords = r18.code + ',' + parseInt(r18.code.split('-')[1]);
	}

	ctx.body = ctx.dots.index({
		type: 'jvr',
		pageTitle: title.slice(0, 150),
		r18: r18 && r18.code && formatSingleEntryForRender(r18, ctx.zh),
		relatedR18s,
		relatedKeyword,
		reletedHref,
		keywords
	});
	return;
}
