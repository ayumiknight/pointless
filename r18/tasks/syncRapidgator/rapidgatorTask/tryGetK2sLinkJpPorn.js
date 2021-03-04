const { tezP } = require('./k2sConfig');
const axios = require('axios');
const axiosRretry = require('axios-retry');
const cheerio = require('cheerio');
const fs = require('fs');

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

async function tryGetK2sLinkJpPorn({
	code
}) {

	let [ series, id ] = code.split('-');

	// https://avcens.xyz/?s=sivr+096
	let searchResult = await axios({
    method: 'POST',
    url: 'https://jp-porn.org/index.php?do=search',
    headers: {
      contentType: 'application/x-www-form-urlencoded'
    },
    data: `do=search&subaction=search&search_start=0&full_search=0&result_from=1&story=${series}+${id}`
  })
  let $ = cheerio.load(searchResult),
		articles = $('#dle-content a');
	
	const k2s = []
	let i = 1;
	while(i <= articles.length) {
		const curArticle = articles[i - 1]
		if (curArticle && $(curArticle).find('h2')) {
			let h2 = $(curArticle).find('h2'),
				href = $(curArticle).attr('href'),
				title = h2.text();

			if (matchTitle({
				title,
				series,
				id
			})) {
				const curRes = await axios.get(href)
				const $curRes = cheerio.load(curRes.data)
				$curRes('#dle-content .full-text a').each(function(i, elem) {

					let link = $(this).attr('href');
					if (link && link.match('https://k2s.cc/file/')) {
						k2s.push(link)
					}
				})
			}
		}
		i++
	}

	if (!k2s.length) {
		throw new Error(`${code} not found jpporn\n`);
	}
	return k2s;
}
async function test() {
	const res = await tryGetK2sLinkJpPorn({
		code: 'MDVR-138'
	})
	console.log(res)
}
test()

module.exports = tryGetK2sLinkJpPorn;