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
		if (title.toUpperCase().match(series) && title.slice(0,30).toUpperCase().match(id)) {
			return true;
		}
	}
	return false;
}

async function getJavInfo(href) {
	let detail = await axios.get(href);

	let $d = cheerio.load(detail.data),
		articleContent = $d('#post-entry .post-meta-single .post-content');

	let rapidgator = [];
	let k2s = [];

	articleContent.find('a').each(function(i, elem) {
		let link = $d(this).attr('href');
		if (link && link.match('rapidgator')) {
			rapidgator.push(link);
		} else if (link && link.match('https://k2s.cc/file/')) {
			k2s.push(link)
		}
	})
	const rpMp4 = rapidgator.filter(el => {
		return el.match(/^.+\.mp4.html$/i)
	})
	const k2sMp4 = k2s.filter(el => {
		return el.match(/^.+\.mp4$/i)
	})
	return {
		href,
		rapidgator,
		k2s,
		hasMp4: rpMp4.length || k2sMp4.length
	}
}
async function tryGetRapidgatorLink({
	code
}) {

	let [ series, id ] = code.split('-'),
		javInfo

	//http://javarchive.com/?s=3dsvr+0551
	let searchResult = await axios.get(`http://javarchive.com/?s=${series}+${id}`);

	let $ = cheerio.load(searchResult.data);
	
	let javInfoCandidate = {},
		index = 1;
	while(index < 6) {
		let article = $(`#content .post-meta:nth-child(${index})`);
		if (article[0] && article.find('a')) {
			let a = article.find('a'),
				href = a.attr('href'),
				title = a.attr('title') || '';
			if (matchTitle({
				title,
				series,
				id
			})) {
				javInfoCandidate[index] = await getJavInfo(href);
			}
		}
		index++;
	}
	const javInfoKeys = Object.keys(javInfoCandidate);
	if (javInfoKeys.length) {
		let hasMp4 = javInfoKeys.find(one => {
			return javInfoCandidate[one].hasMp4;
		});
		if (hasMp4) {
			javInfo = javInfoCandidate[hasMp4];
		} else {
			javInfo = javInfoCandidate[javInfoKeys[0]]
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