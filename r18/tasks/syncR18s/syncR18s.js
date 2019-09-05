const fs = require('fs');
const axios = require('axios');
const axiosRretry = require('axios-retry');
const cheerio = require('cheerio');
const path = require('path');
const url = require("url");
const parseEntry = require('./parseEntry/parseEntry.js')

//axios包一层retry
axiosRretry(axios, { retries: 3 });


function getPageUrl(pageindex) {
    return `https://www.r18.com/videos/vod/movies/list/id=6793/pagesize=30/price=all/sort=new/type=category/page=${pageindex}/?dmmref=pc_header`
}

async function loadPage(pageindex) {

    let pageUrl = getPageUrl(pageindex),
        res;
    try {
        res = await axios.get(pageUrl); 
    } catch(e) {
        console.warn(`${+new Date()} : load page failed at ${pageindex} !!!!!!!!!!!!!!1`);
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


async function loadPageEntries(entries) {
    let allEntries = await Promise.all(entries.map(url => {
        return Promise.all([
            axios.get(url),
            axios.get(url + '&lg=zh')
        ]).then((e) => {
            console.warn(`${+new Date()} : load jvr failed at ${url} !!!!!!!!!!!!!!1`)
            return [null , null]
        });
    }));

    formattedEntries = allEntries.map(entryRes => {
        return parseEntry(entryRes);
    }).filter(formatted => !!formatted);
    return formattedEntries;
}

async function generateData(pageIndex) {
    let formattedEntryUrls = await loadPage(pageIndex);
    let formattedEntries = await loadPageEntries(formattedEntryUrls);
    return formattedEntries;
}


module.exports = generateData;
