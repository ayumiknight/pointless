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


async function loadAndSave(entries) {
    let i = 0;
    while( i < entries.length) {
        let url = entries[i];
        let raw = await Promise.all([
            axios.get(url),
            axios.get(url + '&lg=zh')
        ]).catch((e) => {
            console.warn(`${+new Date()} : load jvr failed at ${url} !!!!!!!!!!!!!!1`)
            return [null , null]
        });
        let r18Parsed = parseEntry(raw);
        if (r18Parsed && r18Parsed.code) {
            let res = await R18Create({
                entry: r18Parsed
            });
            if (!res) {
                throw new Error(`syncR18s stopped at =========${r18Parsed.code}`)
            }
        }
        i++;
    }
}

async function savePage(pageIndex) {
    let formattedEntryUrls = await loadPage(pageIndex);
    let result = await loadAndSave(formattedEntryUrls);
    return result;
}


module.exports = savePage;
