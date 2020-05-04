const fs = require('fs');
const axios = require('axios');
const axiosRretry = require('axios-retry');
const cheerio = require('cheerio');


axiosRretry(axios, { retries: 3 });


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
		if (title.toUpperCase().match(series + '-' + id)) {
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
			if (title.toUpperCase().match(series) && title.match((id * 1) + '')) {
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
		throw new Error(`${code} not found`);
	}
	if (!javInfo.rapidgator.length) {
		throw new Error(`${code} rapidgator links not found`);
	}
	return javInfo;
}

module.exports = tryGetRapidgatorLink;