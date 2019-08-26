const moment = require('moment');

const util = {
	getStudioTranslated(studio) {

		if (!studio || !studio.studio_id) return '----';
		return `<a href="/studio?studio=${encodeURIComponent(studio.en)}">${studio.en}</a>`
	},
	getSeriesTranslated(series) {

		if (!series || !series.series_id) return '----';
		return `<a href="/series?series=${encodeURIComponent(series.en)}">${series.en}</a>`
	},
	getCategorysTranslated(categories) {
		if (!categories || !categories.length) return '----';
		return categories.map( cate => `<a href="/genre?genre=${encodeURIComponent(cate.en)}">${cate.en}</a>`).join('');
	},
	getActressTranslated(actresses) {
		if (!actresses || !actresses.length) return '----';
		return actresses.map( actress => `<a href="/cast?cast=${encodeURIComponent(actress.en)}">${actress.en}</a>`).join('');
	},
	formatSingleEntryForRender(entry) {

		let details = {
			"ID": entry.code,
			"Release Date": moment(entry.released).isValid ? moment(entry.released).format('YYYY-MM-DD') : '----',
			"Length": entry.duration * 1 ? entry.duration + ' mins' : '----',
			"Director": entry.director || '----',
			"Casts": util.getActressTranslated(entry.Actresses),
			"Studio": util.getStudioTranslated(entry.Studio),
			"Series": util.getSeriesTranslated(entry.Series),
			"Genres": util.getCategorysTranslated(entry.Categories),
			
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
					url: util.addQuery('page', index , baseUrl),
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
	formatCode(search) {
		let number = search.match(/\d+/) && search.match(/\d+/)[0],
			letter = search.match(/[a-zA-Z]+/) && search.match(/[a-zA-Z]+/)[0] || '';
		letter = letter.toUpperCase();

		return `${letter}-${number}`;
	}
}

module.exports = util;
