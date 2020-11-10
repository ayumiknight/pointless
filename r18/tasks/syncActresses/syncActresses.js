const fs = require('fs');
const axios = require('axios');
const axiosRretry = require('axios-retry');
const cheerio = require('cheerio');
const path = require('path');
const url = require("url");
const { getIdFromUrl, getDuration, getText, getTextWithId, getActress, getTitle } = require('../util.js');
const { 
	ActressesBulkCreate, 
	SyncDB,
	measureActresses,
	sequelize
} = require('../../sequelize/methods/index.js');

//https://www.r18.com/videos/vod/movies/actress/letter=a/sort=popular/page=330/
//https://www.r18.com/videos/vod/movies/studio/letter=a/sort=popular/page=1/?lg=zh

axiosRretry(axios, { retries: 3 });


let actressTotalPage = 11,
actressCurrentPage = 1;

function getPageUrl(pageindex) {
	return `https://www.r18.com/videos/vod/movies/actress/letter=a/sort=popular/page=${pageindex}/`
}


async function loadPage(pageindex) {
	let pageUrl = getPageUrl(pageindex);

	let [res, zhRes] = await Promise.all([
		axios.get(pageUrl),
		axios.get(pageUrl + '?lg=zh')
	]);


	let $ = cheerio.load(res.data),
		actresses = $('body .cmn-sec-item01.type01 .cmn-list-product03.clearfix li'),
		formattedActresses = [];

	if (pageindex === 1) {
		let paginations = $('body .cmn-list-pageNation01 ol li'),
			max = 0;

		paginations.each(function(i, entry) {
			let pageNum = $(this).find('a').text().trimStart().trimEnd() * 1;
			pageNum > actressTotalPage ? actressTotalPage = pageNum : null;
		})
	}

	actresses.each(function(i, entry) {
		let logo = $(this).find('a img').attr('src') || `https://pics.r18.com/mono/actjpgs/nowprinting.gif`,
			id = getIdFromUrl($(this).find('a').attr('href') || "", 'id'),
			nameDivs = $(this).find('a .txt01 div'),
			formattedName = "";
		
		nameDivs.each(function(i, div) {
			formattedName += $(this).text().trimStart().trimEnd() + ' ';
		})
		formattedActresses.push({
			logo,
			actress_id: id,
			en: formattedName
		})
	})

	let zh$ = cheerio.load(zhRes.data),
		zhActresses = zh$('body .cmn-sec-item01.type01 .cmn-list-product03.clearfix li');
   
   	zhActresses.each(function(i, entry) {
   		let nameDivs = $(this).find('a .txt01 div'),
			formattedName = "";
   		
   		nameDivs.each(function(i, div) {
   			formattedName += $(this).text().trimStart().trimEnd() + ' ';
   		})

	   	formattedActresses[i]['zh'] = formattedName;
  	})
	await ActressesBulkCreate(formattedActresses);
}



async function index() {
	actressCurrentPage = 1
	let before = await measureActresses();
	console.log(+ new Date() + ': actresses started' + JSON.stringify(before) + '\n', actressCurrentPage, actressTotalPage)
	while (actressCurrentPage <= actressTotalPage) { 
		console.log(+ new Date() + ': crawling page ' + actressCurrentPage +  '\n', actressTotalPage)
		await loadPage(actressCurrentPage);
		actressCurrentPage++;
	}
	await new Promise((resolve, reject) => {
		setTimeout(resolve, 1 * 60 * 1000);
	});
	let after = await measureActresses();
	console.log( + new Date() + ': actresses ended' + JSON.stringify(after) + '\n')
}

module.exports = index;
