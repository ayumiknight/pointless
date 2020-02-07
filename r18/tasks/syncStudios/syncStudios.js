const fs = require('fs');
const axios = require('axios');
const axiosRretry = require('axios-retry');
const cheerio = require('cheerio');
const path = require('path');
const url = require("url");
const { getIdFromUrl, getDuration, getText, getTextWithId, getActress, getTitle } = require('../util.js');
const { 
	StudiosBulkCreate,
	StudiosCreate, 
	SyncDB,
	measureStudios
} = require('../../sequelize/methods/index.js');
//https://www.r18.com/videos/vod/movies/studio/letter=a/sort=popular/page=1/
//https://www.r18.com/videos/vod/movies/studio/letter=a/sort=popular/page=1/?lg=zh

axiosRretry(axios, { retries: 3 });


let totalPage = 1,
	currentPage = 1;

function getPageUrl(pageindex) {
	return `https://www.r18.com/videos/vod/movies/studio/letter=a/sort=popular/page=${pageindex}/`
}


async function loadPage(pageindex) {
	let pageUrl = getPageUrl(pageindex);

	let [res, zhRes] = await Promise.all([
		axios.get(pageUrl),
		axios.get(pageUrl + '?lg=zh')
	]);


	let $ = cheerio.load(res.data),
		studios = $('body .cmn-sec-item01.type01 .cmn-list-info01.clearfix li'),
		formattedStudios = [];

	if (pageindex === 1) {
		let paginations = $('body .cmn-list-pageNation01 ol li'),
			max = 0;

		paginations.each(function(i, entry) {
			let pageNum = $(this).find('a').text().trimStart().trimEnd() * 1;
			pageNum > totalPage ? totalPage = pageNum : null;
		})

	}

	studios.each(function(i, entry) {
		let logo = $(this).find('.box02 .img01 a img').attr('src'),
			id = getIdFromUrl($(this).find('.box02 .img01 a').attr('href') || "", 'id'),
			name = $(this).find('.box02 .txt01 a').text().trimStart().trimEnd();
		
		formattedStudios.push({
			logo,
			studio_id: id,
			en: name
		})
	})

	let zh$ = cheerio.load(zhRes.data),
		zhstudios = zh$('body .cmn-sec-item01.type01 .cmn-list-info01.clearfix li');
   
   	zhstudios.each(function(i, entry) {
   	let name = $(this).find('.box02 .txt01 a').text().trimStart().trimEnd();
   	
	   	formattedStudios[i]['zh'] = name;
  	})
	await StudiosBulkCreate(formattedStudios);
}



async function index() {
	await SyncDB();
	let before = await measureStudios();
	console.log( + new Date() + ': studios started' + JSON.stringify(before) + '\n')
	while (currentPage <= totalPage) {
		await loadPage(currentPage);
		currentPage++;
	}
	await new Promise((resolve, reject) => {
		setTimeout(resolve, 0.5 * 60 * 1000);
	});
	let after = await measureStudios();
	console.log( + new Date() + ': studios ended' + JSON.stringify(after) + '\n\n')
} 

module.exports = index;

