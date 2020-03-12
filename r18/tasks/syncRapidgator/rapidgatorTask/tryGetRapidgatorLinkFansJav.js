const fs = require('fs');
const axios = require('axios');
const axiosRretry = require('axios-retry');
const cheerio = require('cheerio');
const ocrConfig = require('./ocrConfig.js');
const FormData = require('form-data');
const qs = require('querystring')
axiosRretry(axios, { retries: 3 });


async function tryGetRapidgatorLink({
	code
}) {

	let [ series, id ] = code.split(' '),
		javInfo;

	console.log(`https://fansjav.net/?s=${series}+${id}`, 'requesting==========')
	let searchResult = await axios({
		url: `https://fansjav.net/?s=${series}+${id}`,
		method: 'GET'
	});

	let $ = cheerio.load(searchResult.data),
		firstArticle = $('#content article:first-child'),
		secondArticle = $('#content article:nth-child(2)');

	if (firstArticle[0] && firstArticle.find('h2 a')) {
		let a = firstArticle.find('h2 a'),
			href = a.attr('href'),
			title = a.text() || '';
		if (title.toUpperCase().match(series) && title.match(id)) {
			javInfo = {
				href
			};
		}
	}

	if (!javInfo) {
		if (secondArticle[0] && secondArticle.find('h2 a')) {
			let a = secondArticle.find('h2 a'),
				href = a.attr('href'),
				title = a.text() || '';
			if (title.toUpperCase().match(series) && title.match(id)) {
				javInfo = {
					href
				};
			}
		}
	}

	if (javInfo) {
		console.log(javInfo, '=======')
		
		try{
			let detail = await axios.get(javInfo.href);

			let $d = cheerio.load(detail.data),
				contentProtector = $d('#main article .entry-content .content-protector-access-form');

			let contentProtectorId = contentProtector.attr('id');

				contentProtectorId = contentProtectorId.split('-').pop();

			let contentProtectorTokenInput = contentProtector.find('input[name=content-protector-token]'),
				contentProtectorToken = contentProtectorTokenInput.attr('value');

			let base64Image = contentProtector.find('.content-protector-captcha-img').attr('src');

			let ocrForm = new FormData();

			ocrForm.append('base64Image', base64Image);

			let captchaOCR;

			captchaOCR = await axios({
				url: `https://api.ocr.space/parse/image`,
				method: 'POST',
				data: ocrForm,
				headers: {
					...ocrForm.getHeaders(),
    				"Content-Length": ocrForm.getLengthSync(),
					'apiKey': ocrConfig.apiKey
				}
			});

			captchaOCR = parseInt(captchaOCR.ParsedResults[0].ParsedText);

			let captchaForm = {
				'content-protector-captcha': 1,
				'content-protector-password': captchaOCR,
				'content-protector-token': contentProtectorToken,
				'content-protector-ident': contentProtectorId,
				'content-protector-submit': '>>>Click here submit<<<'
			}
			let queryString = qs.stringify(captchaForm)

			let detailUnlocked = await axios({
				url: javInfo.href,
				data: queryString,
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			})

			let $u = cheerio.load(detailUnlocked.data),
				contentProtector = $d('#main article .entry-content .content-protector-access-form');

			let rapidgatorLinks = contentProtector.find()

		} catch(e) {
			console.log(e.message)
		}


		
		
	}

	// javInfo.pixhost = [];
	// 	javInfo.rapidgator = [];

	// 	articleContent.find('img').each(function(i, elem) {

	// 		let link = $(this).attr('href');
	// 		if (link && (link.match('pixhost') || link.match('javstore.net'))) {
	// 			let thumb = $(this).find('img').attr('src');
	// 			javInfo.pixhost.push({
	// 				thumb,
	// 				link
	// 			})

	// 		} else if (link && link.match('rapidgator')) {
	// 			javInfo.rapidgator.push(link);
	// 		}
	// 	})
	if (!javInfo) {
		throw new Error(`${code} not found`);
	}
	if (!javInfo.rapidgator.length) {
		throw new Error(`${code} rapidgator links not found`);
	}
	return javInfo;
}
tryGetRapidgatorLink({
	code: 'KAVR 060'
})
module.exports = tryGetRapidgatorLink;