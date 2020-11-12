const fs = require('fs');
const axios = require('axios');
const axiosRretry = require('axios-retry');
const cheerio = require('cheerio');

async function getJpOrgRecentPage (page) {
  const url = page !== 1 ? `https://jp-porn.org/vr/page/${page}` : 'https://jp-porn.org/vr/';
  const list = await axios.get(url);
  const dom = cheerio.load(list.data);
  const atags = dom('a.img-wide');
  const links = [];
  atags.each(function(i, elem) {
    const href = dom(this).attr('href');
    href && links.push(href);
  })
  console.log(links)
  let i = 0;
  const k2sLinks = []
  while(i < links.length) {
    try {
      const single = await axios.get(links[i]);
      let singleDom = cheerio.load(single.data);
      singleDom('a').each(function(i, elem) {
        const href = singleDom(this).attr('href');
        if (href && href.match(/^.+k2s.cc\/file\/.+$/)) {
          k2sLinks.push(href)
        }
      })
    } catch(e) {
      console.log(i, links[i], 'wrong')
    }
   
    i++
  }
  console.log(k2sLinks)
  return k2sLinks;
}

async function getJpOrgRecent() {
  if (global.lastJpOrgRecent) {
    return global.lastJpOrgRecent;
  }
  const page1 = await getJpOrgRecentPage(1);
  const page2 = await getJpOrgRecentPage(2);
  const page3 = await getJpOrgRecentPage(3);
  global.lastJpOrgRecent = page1.concat(page2).concat(page3);
  setTimeout(() => {
    global.lastJpOrgRecent = null;
  }, 1000 * 60 * 5)
  return global.lastJpOrgRecent;
}

module.exports = getJpOrgRecent;