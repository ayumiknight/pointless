const moment = require('moment');

const util = {
	getStudioTranslated(studio, zh) {

		if (!studio || !studio.studio_id) return '----';
		let studio_name = zh ? studio.zh : studio.en;
		return `<a rel="nofollow" href="${zh? '/zh' : ''}/studio?studio=${encodeURIComponent(studio_name)}">${studio_name}</a>`
	},
	getSeriesTranslated(series, zh) {

		if (!series || !series.series_id) return '----';
		let series_name = zh ? series.zh : series.en;
		return `<a rel="nofollow" href="${zh? '/zh' : ''}/series?series=${encodeURIComponent(series_name)}">${series_name}</a>`
	},
	getCategorysTranslated(categories, zh) {
		if (!categories || !categories.length) return '----';	
		return categories.map( cate => {
			let cate_name = zh ? cate.zh || cate.en : cate.en;
			return cate_name ? `<a rel="nofollow" href="${zh? '/zh' : ''}/genre?genre=${encodeURIComponent(cate_name)}">${cate_name}</a>` : '';
		}).join('');
	},
	getActressTranslated(actresses, zh) {
		if (!actresses || !actresses.length) return '----';
		return actresses.map( actress => {
			let actress_name = zh ? actress.zh : actress.en;
			return actress_name ? `<a rel="nofollow" href="${zh? '/zh' : ''}/cast?cast=${encodeURIComponent(actress_name)}">${actress_name}</a>` : '';
		}).join('');
	},
	formatSingleEntryForRender(entry, zh) {

		let details = {
			"ID": entry.code,
			"Release Date": moment(entry.released).isValid ? moment(entry.released).format('YYYY-MM-DD') : '----',
			"Length": entry.duration * 1 ? entry.duration + (zh ? '分钟' : 'mins' ) : '----',
			"Director": entry.director || '----',
			"Casts": util.getActressTranslated(entry.Actresses, zh),
			"Studio": util.getStudioTranslated(entry.Studio, zh),
			"Series": util.getSeriesTranslated(entry.Series, zh),
			"Genre": util.getCategorysTranslated(entry.Categories, zh),
			
		};
		entry.details = details;
		return entry;
	},
	generatePagination(pageinfo) {
		let { total, current, baseUrl } = pageinfo,
			leftCount = current - 1,
			rightCount = total - current,
			pages = [];

		if (total <= 9) {
			pages = [...Array(total)].map((v, index) => {
				return {
					url: util.addQuery('page', index + 1 , baseUrl),
					page: index + 1,
					className: index + 1 === current ? 'current' : ''
				}		
			});
		} else if (leftCount >= 4 && rightCount >= 4 ) {
			pages = [...Array(9)].map((v,index) => {
				return {
					url: util.addQuery('page', current - 4 + index , baseUrl),
					page: current - 4 + index,
					className: current - 4 + index === current ? 'current': ''
				}
			})
		} else {
			leftCount < 4 ? pages = [...Array(9)].map((v,index) => {
				return {
					url: util.addQuery('page', 1 + index , baseUrl),
					page: 1 + index,
					className: 1 + index === current ? 'current': ''
				}
			}) : pages = [...Array(9)].map((v,index) => {
				return {
					url: util.addQuery('page', total - 8 + index, baseUrl),
					page: total - 8 + index,
					className: total - 8 + index === current ? 'current': ''
				}		
			})
		}
		pages.push({
			url: util.addQuery('page', current + 1, baseUrl),
			page: 'next',
			disabled: current === total
		})
		pages.unshift({
			url: util.addQuery('page', current - 1, baseUrl),
			page: 'prev',
			disabled: current === 1
		})
		return pages;
	},
	addQuery(key, value, href = location.href) {
		var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
		var separator = href.indexOf('?') !== -1 ? "&" : "?";
		if (href.match(re)) {
			return href.replace(re, '$1' + key + "=" + value + '$2');
		}
		else {
			return href + separator + key + "=" + value;
		}
	},
	addQueries(kvPairs, href = location.href) {
		let keys = Object.keys(kvPairs),
			result = href;

		keys.forEach(key => {
			let value = kvPairs[key];
			result = util.addQuery(key, value, result);
		});
		return result;
	},
	getAtoZ() {
		if (util.AtoZ) return util.AtoZ;
		
		let AtoZ = [];	 
	    for(var i = 97; i < 123; i++){
	        AtoZ.push(String.fromCharCode(i));
	    }
	    util.AtoZ = AtoZ;
	    return AtoZ;
	},
	generateLetterPagination(pageinfo) {
		let { baseUrl, current } = pageinfo,
			letters = util.getAtoZ();


		return letters.map( letter => {
			return {
				url: util.addQueries({
					letter,
					page: 1
				}, baseUrl),
				className: letter === current.toLowerCase() ? 'current' : '',
				letter
			}
		});
	},
	formatCode(search = "") {
		return search.replace(/^([0-9]*[a-zA-Z]+)[-\s]*([0-9]+)$/g, '$1-$2');
	}
	
}

module.exports = util;
