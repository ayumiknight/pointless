

const { R18BulkCreate, R18Create,  SyncDB, measureR18s } = require('../../sequelize/methods/index.js');
const savePage = require('./syncR18s.js');
var fs = require('fs');
var util = require('util');

let pageAll = process.env.limit || 2;
async function crawlAndCreate() {
	let before = await measureR18s();
	console.log(+ new Date() + ': r18s started' + JSON.stringify(before) + '\n')
	let pageindex = process.env.offset || 1;
	while( pageindex <= pageAll) {	
		try {
			let result = await savePage(pageindex);
			console.log(`${+ new Date()} : page ${pageindex} crawled \n`, { flag : 'a'})
		} catch(e) {
			console.log(`${+ new Date()} : ` + (e.message || e.msg) + `error at page ${pageindex}!!!! \n`, { flag : 'a'})
		}
		pageindex += 1;

	}
	await new Promise((resolve, reject) => {
		setTimeout(resolve, 0.5 * 60 * 1000);
	})
	let after = await measureR18s();
	console.log(+ new Date() + ': r18s ended'  + JSON.stringify(after) + '\n\n')
}


module.exports = crawlAndCreate;
