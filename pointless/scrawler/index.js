const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

//https://www.weirdgoogleearth.com/page/2/
let root = 'https://www.weirdgoogleearth.com/',
  pageCount = 1,
  allData = [];

index();
//loadEntry('https://www.weirdgoogleearth.com/2013/11/03/coca-cola-logo/');

async function loadPage(index) {
  let pageUrl = `${root}page/${index}`;
  console.log(`getting ${pageUrl}`);
  let res = await axios.get(pageUrl);

  let $ = cheerio.load(res.data),
    entries = $('.content .post-entry-inner article .post-more a'),
    formattedEntries = [];

  entries.each(function(i, entry) {
    let link = $(this).attr('href');
    formattedEntries.push(link || '');
  })
  return formattedEntries;
}

async function loadPageEntries(entries) {

  let allEntries = await Promise.all(entries.map(url => {
    return axios.get(url);
  }));
  formattedEntries = allEntries.map(entryRes => {
    let $ = cheerio.load(entryRes.data),
      paragraphs = $('.content .post-entry-inner .entry-content p'),
      formattedCover = $('.content .post-entry-inner .entry-content .wp-block-image img').attr('data-orig-file') || $('.content .post-entry-inner .entry-content a img').attr('data-orig-file'),
      formattedParagraphs = [];

    paragraphs.each(function(i, paragraph) {
      let inner = $(this).text();
      formattedParagraphs.push(inner);
    });

    return {
      formattedParagraphs,
      formattedCover,
      url: entryRes.config.url

    }
  })
  return formattedEntries;

}



async function index() {
  let currentPage = 1;
  while (currentPage <= 61) {
    let formattedEntries = await loadPage(currentPage),
      pageData = await loadPageEntries(formattedEntries);

    allData.push({
      page: `${root}page/${currentPage}`,
      pageData
    });
    currentPage++;
  }
  fs.writeFileSync('./result.txt', JSON.stringify(allData))
}
