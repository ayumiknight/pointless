const moment = require('moment');

function formatSingleEntryForRender(entry) {

	let details = {
		"ID": entry.code,
		"Release Date": moment(entry.released).isValid ? moment(entry.released).format('YYYY-MM-DD') : '----',
		"Length": entry.duration * 1 ? entry.duration + ' mins' : '----',
		"Director": entry.director || '----',
		"Channel": entry.channel || '----',
		"Studio": getStudioTranslated(entry.Studio),
		"Series": getSeriesTranslated(entry.Series),
		"Genres": getCategorysTranslated(entry.Categories),
		"Casts": getActressTranslated(entry.Actresses)
	};
	entry.details = details;
	return entry;
}

function getStudioTranslated(studio) {

	if (!studio || !studio.studio_id) return '----';
	return `<a href="/studio?id=${studio.studio_id}">${studio.en}</a>`
}

function getSeriesTranslated(series) {

	if (!series || !series.series_id) return '----';
	return `<a href="/series?id=${series.series_id}">${series.en}</a>`
}

function getCategorysTranslated(categories) {
	if (!categories || !categories.length) return '----';
	return categories.map( cate => `<a href="/genre?id=${cate.category_id}">${cate.en}</a>`).join('');
}

function getActressTranslated(actresses) {
	if (!actresses || !actresses.length) return '----';
	return actresses.map( actress => `<a href="/actress?id=${actress.actress_id}">${actress.en}</a>`).join('');
}

const util = {
	formatSingleEntryForRender
}

module.exports = util;
