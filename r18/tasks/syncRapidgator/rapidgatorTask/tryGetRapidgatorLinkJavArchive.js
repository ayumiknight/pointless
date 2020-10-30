const fs = require('fs');
const axios = require('axios');
const axiosRretry = require('axios-retry');
const cheerio = require('cheerio');


axiosRretry(axios, { retries: 3 });


function matchTitle({
	series,
	id,
	title
}) {
	if (title.toUpperCase().match(series + '-' + id)) {
		return true
	};
	if (id * 1 >= 100) {
		if (title.toUpperCase().match(series) && title.toUpperCase().match(id)) {
			return true;
		}
	}
	return false;
}

async function tryGetRapidgatorLink({
	code
}) {

	let [ series, id ] = code.split(' '),
		javInfo;

	//http://javarchive.com/?s=3dsvr+0551
	let searchResult = await axios.get(`http://javarchive.com/?s=${series}+${id}`);

	let $ = cheerio.load(searchResult.data),
		firstArticle = $('#content .post-meta:first-child'),
		secondArticle = $('#content .post-meta:nth-child(2)');

	if (firstArticle[0] && firstArticle.find('a')) {
		let a = firstArticle.find('a'),
			href = a.attr('href'),
			title = a.attr('title') || '';
		if (matchTitle({
			title,
			series,
			id
		})) {
			javInfo = {
				href
			};
		}
	}

	if (!javInfo) {
		if (secondArticle[0] && secondArticle.find('a')) {
			let a = secondArticle.find('a'),
				href = a.attr('href'),
				title = a.attr('title') || '';
			if (matchTitle({
				title,
				series,
				id
			})) {
				javInfo = {
					href
				};
			}
		}
	}

	if (javInfo) {
		let detail = await axios.get(javInfo.href);

		let $d = cheerio.load(detail.data),
			articleContent = $d('#post-entry .post-meta-single .post-content');

		javInfo.pixhost = [];
		javInfo.rapidgator = [];
		javInfo.k2s = [];

		articleContent.find('a').each(function(i, elem) {

			let link = $(this).attr('href');
			if (link && link.match('rapidgator')) {
				javInfo.rapidgator.push(link);
			} else if (link && link.match('"https://k2s.cc/file/')) {
				javInfo.k2s.push(link)
			}
		})
		const rpMp4 = javInfo.rapidgator.filter(el => {
			return el.match(/^.+\.mp4$/i)
		})
		const k2sMp4 = javInfo.k2s.filter(el => {
			return el.match(/^.+\.mp4$/i)
		})
		if (rpMp4.length) {
			javInfo.rapidgator = rpMp4
		}
		if (k2sMp4.length) {
			javInfo.k2s = k2sMp4
		}
	}
	if (!javInfo) {
		throw new Error(`${code} not found javarchive\n`);
	}
	if (!javInfo.rapidgator.length) {
		throw new Error(`${code} rapidgator links not found javarchive\n`);
	}
	return javInfo;
}

module.exports = tryGetRapidgatorLink;