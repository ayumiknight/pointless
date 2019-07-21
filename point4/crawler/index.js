const fs = require('fs');
const axios = require('axios');
const axiosRretry = require('axios-retry');
const cheerio = require('cheerio');
const path = require('path');
const url = require("url");
//https://www.weirdgoogleearth.com/page/2/
let root = 'https://www.weirdgoogleearth.com/',
  pageCount = 10,
  xmlArray = [],
  counter = {
  	current: 1
  };
 // var access = fs.createWriteStream('./node.access.log', { flags: 'a' })
 // 	process.stdout.pipe(access);


index();
axiosRretry(axios, { retries: 3 });

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

async function loadPageEntries(entries, currentPage) {

  let allEntries = await Promise.all(entries.map(url => {
    return axios.get(url);
  }));
  formattedEntries = allEntries.map(entryRes => {
    let $ = cheerio.load(entryRes.data),
      paragraphs = $('.content .post-entry-inner .entry-content p'),
      formattedCover = ($('.content .post-entry-inner .entry-content img').attr('data-orig-file') || "").split('?')[0],
      iframes = $('.content .post-entry-inner .entry-content iframe'),
      formattedEmbedMapLink,
      location,
      name,
      latlng,
      desc;

    paragraphs.each(function(i, paragraph) {
      let inner = ($(this).text() || "").trim();

      if (inner) {
      	if (inner.match(/^location/i)) {
      		location = inner.replace(/^location.*\:/i, '');
      	} else if (inner.match(/^lat/i)) {
      		latlng = inner.replace(/^lat.*long.{0,3}\:/i, '');
      	} else if (inner.match(/^name/i)) {
      		name = inner.replace(/^name.{0,3}\:/i, '');
      	} else if (!inner.match(/</)){
      		desc = inner;
      	}
      }
    });

    iframes.each(function(i, iframe) {
    	if ($(this).attr('src').match('www.google.com')) {
    		formattedEmbedMapLink = $(this).attr('src');
    	}
    })
    console.log({
      name,
      location,
      latlng
    })
    if (!name || !location || !latlng || !formattedCover) {
    	console.log(`wrong entry with url ${entryRes.config.url} on page ${currentPage}+++++++++++++++++++++++++++++++=`)
    	return null;
    }

    return {
      name,
      location,
      latlng,
      desc,
      formattedCover,
      formattedEmbedMapLink,
      originalUrl: entryRes.config.url

    }
  })
  return formattedEntries;

}

function getFileNameFromUrl(input) {
	var parsed = url.parse(input);
	return path.basename(parsed.pathname)
}
function generateXMLForWordpress(entry) {
	if (!entry) return '';

	let = { 
	  name,
	  location,
	  latlng,
	  desc = "",
      formattedCover,
      formattedEmbedMapLink,
      originalUrl
    } = entry;
    counter.current = counter.current + 2;
    let coverName = getFileNameFromUrl(formattedCover).split('.')[0];

	return `<item>
		<title>${coverName}</title>
		<link>${formattedCover}</link>
		<pubDate>Sun, 22 Jun 2019 20:24:33 +0000</pubDate>
		<dc:creator></dc:creator>
		<guid isPermaLink="false">${formattedCover}</guid>
		<description></description>
		<content:encoded><![CDATA[]]></content:encoded>
		<excerpt:encoded></excerpt:encoded>
		<wp:post_id>${counter.current}</wp:post_id>
		<wp:post_date><![CDATA[2019-06-22 20:24:33]]></wp:post_date>
		<wp:post_date_gmt><![CDATA[2019-06-22 20:24:33]]></wp:post_date_gmt>
		<wp:comment_status><![CDATA[open]]></wp:comment_status>
		<wp:ping_status><![CDATA[closed]]></wp:ping_status>
		<wp:post_name><![CDATA[${coverName}]]></wp:post_name>
		<wp:status><![CDATA[inherit]]></wp:status>
		<wp:post_parent>0</wp:post_parent>
		<wp:menu_order>0</wp:menu_order>
		<wp:post_type><![CDATA[attachment]]></wp:post_type>
		<wp:post_password><![CDATA[]]></wp:post_password>
		<wp:is_sticky>0</wp:is_sticky>
		<wp:attachment_url><![CDATA[${formattedCover}]]></wp:attachment_url>
		<wp:postmeta>
			<wp:meta_key><![CDATA[_wp_attached_file]]></wp:meta_key>
			<wp:meta_value><![CDATA[${'2019/06/' + getFileNameFromUrl(formattedCover)}]]></wp:meta_value>
		</wp:postmeta>
		</item>
		<item>
		<title>${name}</title>
		<link>https://demo.thememattic.com/minimal-grid/blog/2018/12/24/a-brief-history-of-raf-simonss-storied-career-in-fashion/</link>
		<pubDate>Sun, 22 Jun 2019 20:24:33 +0000</pubDate>
		<dc:creator><![CDATA[themeauthor@thememattic.com]]></dc:creator>
		<guid isPermaLink="false">https://demo.thememattic.com/minimal-grid/?p=132</guid>
		<description></description>
		<content:encoded><![CDATA[
<!-- wp:paragraph -->
<p>Location: ${location}</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Coordinates: ${latlng}</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
<figure><iframe src=${formattedEmbedMapLink} width="600" height="450" allowfullscreen=""></iframe></figure>
<!-- /wp:html -->

]]></content:encoded>
		<excerpt:encoded><![CDATA[${desc}]]></excerpt:encoded>
		<wp:post_id>${counter.current + 1}</wp:post_id>
		<wp:post_date><![CDATA[2019-06-22 20:24:33]]></wp:post_date>
		<wp:post_date_gmt><![CDATA[2019-06-22 20:24:33]]></wp:post_date_gmt>
		<wp:comment_status><![CDATA[open]]></wp:comment_status>
		<wp:ping_status><![CDATA[open]]></wp:ping_status>
		<wp:post_name><![CDATA[${name}]]></wp:post_name>
		<wp:status><![CDATA[publish]]></wp:status>
		<wp:post_parent>0</wp:post_parent>
		<wp:menu_order>0</wp:menu_order>
		<wp:post_type><![CDATA[post]]></wp:post_type>
		<wp:post_password><![CDATA[]]></wp:post_password>
		<wp:is_sticky>0</wp:is_sticky>
		<wp:postmeta>
			<wp:meta_key><![CDATA[_thumbnail_id]]></wp:meta_key>
			<wp:meta_value><![CDATA[${counter.current}]]></wp:meta_value>
		</wp:postmeta>
	</item>`

}

async function index() {
  let currentPage = 1;

  while (currentPage <= 61) {
    let formattedEntries = await loadPage(currentPage),
      pageData = await loadPageEntries(formattedEntries, currentPage);
      Array.prototype.push.apply(xmlArray, pageData.map( data => {
      	return generateXMLForWordpress(data);
      }));
    
    currentPage++;
  }
 
  let xml = xmlArray.filter( xmlItem => {
  	return !!xmlItem;
  }).join('\n');
  fs.writeFileSync('./result.xml', xml)
}
