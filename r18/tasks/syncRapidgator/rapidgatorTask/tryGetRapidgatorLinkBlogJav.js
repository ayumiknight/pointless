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

	let searchResult = await axios.get(`http://blogjav.net/?s=${series}+${id}`);

	let $ = cheerio.load(searchResult.data),
		firstArticle = $('#content .single:first-child h1'),
		secondArticle = $('#content .single:nth-child(2) h1');


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
			articleContent = $d('#content .entry');

		javInfo.pixhost = [];
		javInfo.rapidgator = [];

		articleContent.find('a').each(function(i, elem) {

			let link = $(this).attr('href');
			if (link && (link.match('pixhost') || link.match('javstore.net'))) {
				let thumb = $(this).find('img').attr('src');
				javInfo.pixhost.push({
					thumb,
					link
				})

			} else if (link && link.match('rapidgator')) {
				javInfo.rapidgator.push(link);
			}
		})
	}
	if (!javInfo) {
		throw new Error(`${code} not found blogjav\n`);
	}
	if (!javInfo.rapidgator.length) {
		throw new Error(`${code} rapidgator links not found blogjav\n`);
	}
	return javInfo;
}

module.exports = tryGetRapidgatorLink;