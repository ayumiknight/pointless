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
	const pattern = new RegExp(`${series}-?${id}`, 'i')
	if (pattern.test(title)) return true

	if (id * 1 > 100 && id.length === 3) {
		const patternPaddingZero = new RegExp(`${series}-?0${id}`, 'i')
		if (patternPaddingZero.test(title)) return true
	}
	return false;
}

async function getJavInfo(href) {
	let detail = await axios.get(encodeURI(href));

	let $d = cheerio.load(detail.data),
		articleContent = $d('.news');

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
	let searchResult = await axios.get(`http://javstore.net/search/${series}-${id}.html`);
	let $ = cheerio.load(searchResult.data);
	let javInfoCandidate = {},
		index = 1;
	while(index < 6) {
		let article = $(`#content_news li:nth-child(${index})`);
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
	const maybeWithZero = (id + '').length  === 3 && (id / 100 > 1);
	if (!javInfo) {
		if (maybeWithZero) {
			const _javInfo = await tryGetRapidgatorLink({
				code: series + '-0' + id 
			});
			return _javInfo;
		} else {
			throw new Error(`${code} not found javarchive\n`);
		}
	}
	if (!javInfo.rapidgator.length) {
		throw new Error(`${code} rapidgator links not found javarchive\n`);
	}
	return javInfo;
}

module.exports = tryGetRapidgatorLink;
