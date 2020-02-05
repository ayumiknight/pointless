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
		firstArticle = $('#content .post-meta:first-child');


	if (firstArticle[0] && firstArticle.find('a')) {
		let a = firstArticle.find('a'),
			href = a.attr('href'),
			title = a.attr('title') || '';
		if (title.match(series) && title.match((id * 1) + '')) {
			javInfo = {
				href
			};
		}
	}

	if (javInfo) {
		let detail = await axios.get(javInfo.href);

		let $d = cheerio.load(detail.data),
			articleContent = $d('#post-entry .post-meta-single .post-content');
		//console.log(detail.data, '=====================')
		javInfo.pixhost = [];
		javInfo.rapidgator = [];

		articleContent.find('a').each(function(i, elem) {

			let link = $(this).attr('href');
			console.log(link, 'link============');
			if (link && link.match('pixhost')) {
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