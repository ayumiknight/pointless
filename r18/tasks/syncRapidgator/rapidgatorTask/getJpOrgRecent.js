const fs = require('fs');
const axios = require('axios');
const axiosRretry = require('axios-retry');
const cheerio = require('cheerio');
const { get } = require('https');
const { Console } = require('console');

async function getJpOrgRecent () {

  const list = await axios.get('https://jp-porn.org/vr/');
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
getJpOrgRecent()