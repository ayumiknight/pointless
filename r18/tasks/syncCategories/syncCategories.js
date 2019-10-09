const fs = require('fs');
const axios = require('axios');
const axiosRretry = require('axios-retry');
const cheerio = require('cheerio');
const path = require('path');
const url = require("url");
const { getIdFromUrl, getDuration, getText, getTextWithId, getActress, getTitle, safeMerge } = require('../util.js');
const { 
	CategoriesBulkCreate, 
	SyncDB 
} = require('../../sequelize/methods/categories.js');
//https://www.r18.com/videos/vod/movies/category/ 1
//https://www.r18.com/videos/vod/amateur/category/ 2
//https://www.r18.com/videos/vod/anime/category/ 3
//https://www.r18.com/videos/vod/movies/category/?lg=zh
axiosRretry(axios, { retries: 3 });


async function loadCategories({
	indexUrl,
	parentCategory
}) {


	let [res, zhRes] = await Promise.all([
		axios.get(indexUrl),
		axios.get(indexUrl + '?lg=zh')
	]);


	let $ = cheerio.load(res.data),
		categoriesByParent = $('body #contents > ul');
		index = 1,
		zhIndex = 1,
		categoryMap = {};

	categoriesByParent.each(function(i, elem) {

		$(this).find('li').each(function(j, subElem) {
			
			if (index === 1) {
				let name = $(this).find('a .txt01').text().trimStart().trimEnd(),
					logo = $(this).find('a .img01 img').attr('data-original'),
					id = getIdFromUrl($(this).find('a').attr('href') || '', 'id');

				
				let extracted = {
					category_id: id,
					logo,
					en: name,
				};
				extracted[parentCategory] = 1;

				categoryMap[id] = safeMerge(categoryMap[id] || {}, extracted);

			} else {
				let name = $(this).find('a').text().trimStart().trimEnd(),
					id = getIdFromUrl($(this).find('a').attr('href') || '', 'id');

				let extracted = {
					en: name,
					category_id: id,
					parent: index - 1
				};
				categoryMap[id] = safeMerge(categoryMap[id] || {}, extracted);

			}
		})
		index++;
	})


	let zh$ = cheerio.load(zhRes.data),
		zhCategoriesByParent = zh$('body #contents > ul');
   
   	zhCategoriesByParent.each(function(i, elem) {
   			
		$(this).find('li').each(function(j, subElem) {
			
			if (zhIndex === 1) {
				
				let name = $(this).find('a .txt01').text().trimStart().trimEnd(),
					logo = $(this).find('a .img01 img').attr('src'),
					id = getIdFromUrl($(this).find('a').attr('href') || '', 'id');

				let extracted = {
					category_id: id,
					logo,
					zh: name,
				};
				extracted[parentCategory] = 1;

				categoryMap[id] = safeMerge(categoryMap[id] || {}, extracted)

			} else {

				let name = $(this).find('a').text().trimStart().trimEnd(),
					id = getIdFromUrl($(this).find('a').attr('href') || '', 'id');
				id == ""  && console.log('from 4', i, j);
				if (!categoryMap[id]) categoryMap[id] = {};


				let extracted = {
					category_id: id,
					zh: name,
					parent: zhIndex - 1
				};
				categoryMap[id] = safeMerge(categoryMap[id] || {}, extracted);
			}
		})
		zhIndex++;
	})
   	
   	let finalCategories = Object.keys(categoryMap)
   		.map(key => {
   			return {fromAdult: 1, ...categoryMap[key]}
   		});
 
   	fs.writeFileSync(parentCategory + '.txt', JSON.stringify(finalCategories) )
	await CategoriesBulkCreate(finalCategories);
}

async function index() {
	await SyncDB();
	
	await loadCategories({
		indexUrl: 'https://www.r18.com/videos/vod/movies/category/',
		parentCategory: 'topAdult'
	});
	await new Promise((resolve, reject) => {
		setTimeout(resolve, 1 * 60 * 1000);
	});
	// await loadCategories({
	// 	indexUrl: 'https://www.r18.com/videos/vod/amateur/category/',
	// 	parentCategory: 'topAmateur'
	// });
	// await loadCategories({
	// 	indexUrl: 'https://www.r18.com/videos/vod/anime/category/',
	// 	parentCategory: 'topAnime'
	// });
}

module.exports = index;

