const fs = require('fs');
const axios = require('axios');
const axiosRretry = require('axios-retry');
const cheerio = require('cheerio');
const path = require('path');
const url = require("url");
const { getIdFromUrl, getDuration, getText, getTextWithId, getActress, getTitle } = require('../util.js');
const { 
	SeriesBulkCreate, 
	SyncDB,
	measureSeries
} = require('../../sequelize/methods/index.js');

//https://www.r18.com/videos/vod/movies/series/letter=a/sort=popular/page=1/

axiosRretry(axios, { retries: 3 });


let totalPage = 4,
	currentPage = 1;

function getPageUrl(pageindex) {
	return `https://www.r18.com/videos/vod/movies/series/letter=a/sort=popular/page=${pageindex}/`
}


async function loadPage(pageindex) {
	let pageUrl = getPageUrl(pageindex);
	try {
		let [res, zhRes] = await Promise.all([
			axios.get(pageUrl),
			axios.get(pageUrl + '?lg=zh')
		]);


		let $ = cheerio.load(res.data),
			series = $('body .cmn-sec-item01.type01 .cmn-list-info01.clearfix li'),
			formattedSeries = [];

		if (pageindex === 1) {
			let paginations = $('body .cmn-list-pageNation01 ol li'),
				max = 0;

			paginations.each(function(i, entry) {
				let pageNum = $(this).find('a').text().trimStart().trimEnd() * 1;
				pageNum > totalPage ? totalPage = pageNum : null;
			})

		}

		series.each(function(i, entry) {
			let logo = $(this).find('.box01 .img02 img').attr('src'),
				id = getIdFromUrl($(this).find('.box01 .txt01 a').attr('href') || "", 'id'),
				name = $(this).find('.box01 .txt01 a').text().trimStart().trimEnd(),
				desc = $(this).find('.box01 .ftBox .txt02.type01').text().trimStart().trimEnd();

			formattedSeries.push({
				logo,
				series_id: id,
				en: name,
				descEN: desc.slice(0, 999)
			})
		})

		let zh$ = cheerio.load(zhRes.data),
			zhSeries = zh$('body .cmn-sec-item01.type01 .cmn-list-info01.clearfix li');
	   
	   	zhSeries.each(function(i, entry) {
	   		let name = $(this).find('.box01 .txt01 a').text().trimStart().trimEnd(),
				desc = $(this).find('.box01 .ftBox .txt02.type01').text().trimStart().trimEnd();
	   		
	   		formattedSeries[i]['zh'] = name;
	   		formattedSeries[i]['descZH'] = desc.slice(0, 999);
	   	})
		await SeriesBulkCreate(formattedSeries);
	} catch(e) {
		fs.writeFileSync('error.log', `${pageindex} failed ${e.message}\n`, { flag : 'a'});
	}
	
}



async function index() {
	await SyncDB();
	let before = await measureSeries();
	await fs.writeFileSync('./result.txt', JSON.stringify(before) + '\n', { flag : 'a'})
	while (currentPage <= totalPage) {
		let rest = totalPage - currentPage + 1,
			tasks = [...new Array(rest >= 4 ? 4 : rest)].map((value, index) => loadPage(currentPage + index));
		
		await Promise.all(tasks);
		currentPage += 4;
	}
	let after = await measureSeries();
	await fs.writeFileSync('./result.txt', JSON.stringify(after) + '\n\n', { flag : 'a'})
}

index();
