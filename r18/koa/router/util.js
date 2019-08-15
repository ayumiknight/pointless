const moment = require('moment');

const util = {
	getStudioTranslated(studio) {

		if (!studio || !studio.studio_id) return '----';
		return `<a href="/studio?id=${studio.studio_id}">${studio.en}</a>`
	},
	getSeriesTranslated(series) {

		if (!series || !series.series_id) return '----';
		return `<a href="/series?id=${series.series_id}">${series.en}</a>`
	},
	getCategorysTranslated(categories) {
		if (!categories || !categories.length) return '----';
		return categories.map( cate => `<a href="/genre?id=${cate.category_id}">${cate.en}</a>`).join('');
	},
	getActressTranslated(actresses) {
		if (!actresses || !actresses.length) return '----';
		return actresses.map( actress => `<a href="/actress?id=${actress.actress_id}">${actress.en}</a>`).join('');
	},
	formatSingleEntryForRender(entry) {

		let details = {
			"ID": entry.code,
			"Release Date": moment(entry.released).isValid ? moment(entry.released).format('YYYY-MM-DD') : '----',
			"Length": entry.duration * 1 ? entry.duration + ' mins' : '----',
			"Director": entry.director || '----',
			"Channel": entry.channel || '----',
			"Studio": util.getStudioTranslated(entry.Studio),
			"Series": util.getSeriesTranslated(entry.Series),
			"Genres": util.getCategorysTranslated(entry.Categories),
			"Casts": util.getActressTranslated(entry.Actresses)
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
		} else if (left >= 4 && right >= 4 ) {
			pages = [...Array(9)].map((v,index) => {
				return {
					url: util.addQuery('page', index , baseUrl),
					page: current - 4 + index,
					className: page === current ? 'current': ''
				}
			})
		} else {
			left < 4 ? pages = [...Array(9)].map((v,index) => {
				return {
					url: util.addQuery('page', 1 + index , baseUrl),
					page: 1 + index,
					className: page === current ? 'current': ''
				}
			}) : pages = [...Array(9)].map((v,index) => {
				return {
					url: util.addQuery('page', total - 8 + index, baseUrl),
					page: total - 8 + index,
					className: page === current ? 'current': ''
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
	}
}

module.exports = util;
