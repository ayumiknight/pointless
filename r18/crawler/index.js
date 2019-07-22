const fs = require('fs');
const axios = require('axios');
const axiosRretry = require('axios-retry');
const cheerio = require('cheerio');
const path = require('path');
const url = require("url");
const parseEntry = require('./parseEntry.js')

//axios包一层retry
axiosRretry(axios, { retries: 3 });
let pageCount = 49;

function getPageUrl({ pageindex, pagesize = 30 }) {
    return `https://www.r18.com/videos/vod/movies/list/id=6793/pagesize=120/price=all/sort=new/type=category/page=1/?dmmref=pc_header`
}





async function loadPage(pageindex) {
    let pageUrl = getPageUrl(pageindex);

    let res = await axios.get(pageUrl);

    let $ = cheerio.load(res.data),
        entries = $('body ul.cmn-list-product01 li'),
        formattedEntries = [];

    entries.each(function(i, entry) {
        let link = $(this).find('a').attr('href');
        formattedEntries.push(link || '');
    })

    return formattedEntries;
}






async function loadPageEntries(entries, currentPage) {

    let allEntries = await Promise.all(entries.slice(0,10).map(url => {
        return axios.get(url);
    }));
    formattedEntries = allEntries.map(entryRes => {
        return parseEntry(entryRes.data);
    })
    return formattedEntries;

}

async function index() {
    let entries = await loadPage(1);
    let formattedEntries = await loadPageEntries(entries, 1);
    fs.writeFileSync('./crawled.txt', JSON.stringify(formattedEntries))
}


index();
