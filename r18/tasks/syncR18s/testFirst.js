const fs = require('fs');
const axios = require('axios');
const axiosRretry = require('axios-retry');
const cheerio = require('cheerio');
const path = require('path');
const url = require("url");
const parseEntry = require('./parseEntry/parseEntry.js')
const {
    R18Create
} = require('../../sequelize/methods/index.js');
const db = require('../../sequelize/index.js');

const { R18, Series, Studio, Actress, Category, Gallery, sequelize, Extra} = db;
//axios包一层retry
axiosRretry(axios, { retries: 3 });

function getPageUrl(pageindex) {
    return `https://www.r18.com/videos/vod/movies/list/pagesize=30/price=all/sort=new/type=all/page=${pageindex}/?dmmref=pc_header`
}

async function loadPage(pageindex) {

    let pageUrl = getPageUrl(pageindex),
        res;
    try {
        res = await axios.get(pageUrl); 
    } catch(e) {
        console.warn(`${+new Date()} : load page failed at ${pageindex} ${pageUrl} !!!!!!!!!!!!!!1`);
        return [];
    }

    let $ = cheerio.load(res.data),
        entries = $('body ul.cmn-list-product01 li'),
        formattedEntryUrls = [];

    entries.each(function(i, entry) {
        let link = $(this).find('a').attr('href');
        formattedEntryUrls.push(link || '');
    })

    return formattedEntryUrls;
}

async function loadSingle(url) {
	let raw = await Promise.all([
        axios.get(url),
        axios.get(url + '&lg=zh')
    ]).catch((e) => {
        console.warn(`${+new Date()} : load jvr failed at ${url} !!!!!!!!!!!!!!1`)
        return [null , null]
    });
    let r18Parsed = parseEntry(raw);
    return r18Parsed;
}


async function index() {
	let entries1 = await loadPage(1),
		entries2 = await loadPage(2),
		entriesAll = entries1.concat(entries2),
		index = 0,
		needActress,
		needStudio,
		needSeries;

	while(index < entriesAll.length) {
		let entry = await loadSingle(entriesAll[index]);
		if (entry && entry.code) {
			let _R18 = await R18.findOne({
                where: {
                    code: entry.code
                }
            });
            if (_R18) break;

            let [ 
                actresses,
                series,
                studio
            ] = await Promise.all([
                Promise.all((entry.Actresses || []).map(actress => Actress.findOne({
                    where: {
                        actress_id: actress.actress_id
                    }
                }))),
                entry.Series ? Series.findOne({
                    where: {
                        series_id: entry.Series.series_id
                    }
                }) : null,
                entry.Studio ? Studio.findOne({
                    where: {
                        studio_id: entry.Studio.studio_id
                    }
                }) : null,
            ])

            if (!needActress) {
                needActress = !!actresses.reduce((a, b) => {
                    return a || b;
                }, false)
            }
            
            if (!needStudio) {
                needStudio = entry.Studio && !studio;
            }

            if (!needSeries) {
                needSeries = entry.Series && !series;
            }
		}
        index++;
	}
    console.log('stop at ',index, 'returning', {
        needActress,
        needStudio,
        needSeries
    });
    return {
        needActress,
        needStudio,
        needSeries
    };
};


module.exports = index;

