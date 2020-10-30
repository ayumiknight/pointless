const { tezP } = require('./k2sConfig');
const axios = require('axios');
const axiosRretry = require('axios-retry');
const cheerio = require('cheerio');
const fs = require('fs')

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

async function tryGetTexLinkAvcens({
	code
}) {

	let [ series, id ] = code.split(' '),
		javInfo;

	// https://avcens.xyz/?s=sivr+096
	let searchResult = await axios.get(`https://avcens.xyz/?s=${series}+${id}`);
  // const searchResult = {
  //   data: fs.readFileSync(__dirname + '\\sampleSearchResult.html')
  // }
	let $ = cheerio.load(searchResult.data),
		articles = $('#content article');

	if (articles[0] && $(articles[0]).find('.entry-title a')) {
    let a = $(articles[0]).find('.entry-title a'),
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
    if (articles[1] && $(articles[1]).find('.entry-title a')) {
      let a = $(articles[1]).find('.entry-title a'),
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
    // const detail = {
    //   data: fs.readFileSync(__dirname + '\\sampleSIVR-096.html')
    // }
		let $d = cheerio.load(detail.data),
			articleContent = $d('#content .entry-content');

		javInfo.tezFiles = [];

		articleContent.find('a').each(function(i, elem) {

			let link = $(this).attr('href');
			if (link && link.match('https://tezfiles.com/file/')) {
				javInfo.tezFiles.push(link);
			}
		})
	}
	if (!javInfo) {
		throw new Error(`${code} not found avcens\n`);
	}
	if (!javInfo.tezFiles.length) {
		throw new Error(`${code} tezFiles links not found avcens\n`);
  }
  console.log(javInfo)
	return javInfo;
}

tryGetTexLinkAvcens({
  code: 'SIVR 096'
})
module.exports = tryGetTexLinkAvcens;