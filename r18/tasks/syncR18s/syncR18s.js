const fs = require('fs');
const axios = require('axios');
const axiosRretry = require('axios-retry');
const cheerio = require('cheerio');
const path = require('path');
const url = require("url");
const parseEntry = require('./parseEntry/parseEntry.js')
const {
    R18Create,
    getR18SingleSimple
} = require('../../sequelize/methods/index.js');
const { getCode } = require('../util.js');

//axios包一层retry
axiosRretry(axios, { retries: 3 });

global.r18Counter = 0;

let counterFromArgv = process.argv.find(one => one.match(/^--counter(\d+)$/))
let counterValue = counterFromArgv ? counterFromArgv.replace(/^--counter(\d+)$/i, '$1') : 5;
console.log(counterValue, '==========counterValue!!!!!!!!!!!!!!\n\n\n');
counterValue *= 1;

function getPageUrl(pageindex) {
    return `https://www.r18.com/videos/vod/movies/list/id=6793/pagesize=30/price=all/sort=new/type=category/page=${pageindex}/`;
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
        let link = $(this).find('a').attr('href'),
            code = getCode($(this).find('img').attr('alt') || ''),
            vr = !!($(this).find('span').attr('class') || '').match(/vrRibbon/i);

        formattedEntryUrls.push({
            link,
            code,
            vr
        });
    })

    return formattedEntryUrls;
}


async function loadAndSave(entries, allR18s) {
    let i = 0;
    while( i < entries.length) {
        let url = entries[i].link;

        let created = await getR18SingleSimple({
            code: entries[i].code.toUpperCase()
        });

        if (created && created.code) {
            console.log(`${ entries[i].code.toUpperCase()} already created !!!!!!!!!!!!!!!!!!\n`);
            global.r18Counter += 1;
            if (global.r18Counter === counterValue) {
                throw new Error('syncR18 stopped with counter', + global.r18Counter);
            }
            i++;
            continue;
        } else {
            global.r18Counter = 0;
        }
        
        let raw = await Promise.all([
            axios.get(url),
            axios.get(url + '&lg=zh')
        ]).catch((e) => {
            console.warn(`${+new Date()} : load jvr failed at ${url} !!!!!!!!!!!!!!1`)
            return [null , null]
        });
        let r18Parsed = parseEntry(raw);
        if (r18Parsed && r18Parsed.code) {
            r18Parsed.vr = entries[i].vr;
            let res = await R18Create({
                entry: r18Parsed
            });   
        }
        i++;
    }
}

async function savePage(pageIndex, allR18s) {
    let formattedEntryUrls = await loadPage(pageIndex);
    let result = await loadAndSave(formattedEntryUrls, allR18s);
    return result;
}


module.exports = savePage;
