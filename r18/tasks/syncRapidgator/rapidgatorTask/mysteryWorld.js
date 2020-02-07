//https://rapidgator.net/folder/3330879/movie.html
//There is a massive folder on rapidgator that stores javs.
//need to analyze it

const axios = require('axios');
const axiosRretry = require('axios-retry');
const cheerio = require('cheerio');

axiosRretry(axios, { retries: 3 });


var fs = require('fs');
var log_file = fs.createWriteStream(__dirname + `/${+new Date()}debug.log`, {flags : 'w'});

var fn = process.stdout.write;
function write() {
  fn.apply(process.stdout, arguments);
  log_file.write.apply(log_file, arguments);
}
process.stdout.write = write;


async function crawlPage(page) {
	//https://rapidgator.net/folder/3330879/movie.html?ajax=grid&page=523&sort=name
	let files = [];

	console.log(`${page} started ========================`)
	let res = await axios.get(`https://rapidgator.net/folder/3330879/movie.html?ajax=grid&page=${page}&sort=name`);
	if (res && res.data) {
		let $ = cheerio.load(res.data),
			rows = $('#grid tbody tr');

		rows.each(function(i, elem) {
			let file = $(this).find('a').attr('href');
			file && files.push(file)
		})
	}
	console.log(`${page} crawled ${files.length} entries ${files.length !== 100 ? '!!!!!!!!!!!!!!!!!!!!!' : ''}\n`);
	return files;
	
}

async function crawlAll() {
	let pagenum = 2,
		page = 1,
		total = [];

	while (page <= pagenum) {
		let files = await crawlPage(page);
		Array.prototype.push.apply(total, files);
		page++
	}

	let allFiles = fs.createWriteStream(_dirname + `/${+new Date()}allFiles.log`, {flags : 'w'});
	allFiles.write(JSON.stringify(total));
}

crawlAll();