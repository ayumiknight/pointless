

const { R18BulkCreate, R18Create,  SyncDB, measureR18s } = require('../../sequelize/methods/index.js');
const savePage = require('./syncR18s.js');
var fs = require('fs');
var util = require('util');

let pageAllFromArgv = process.argv.find(one => one.match(/^--page(\d+)$/))
let pageAll = pageAllFromArgv ? pageAllFromArgv.replace(/^--page(\d+)$/i, '$1') : 3;
console.log(pageAll, '==========pageAll!!!!!!!!!!!!!!\n\n\n');
pageAll *= 1;


let pageIndexFromArgv = process.argv.find(one => one.match(/^--pageOffset(\d+)$/))
let pageindex = pageIndexFromArgv ? pageIndexFromArgv.replace(/^--pageOffset(\d+)$/i, '$1') : 1;
console.log(pageindex, '==========pageindex!!!!!!!!!!!!!!\n\n\n');
pageindex *= 1;

async function crawlAndCreate(allR18s) {
	let before = await measureR18s();
	console.log(+ new Date() + ': r18s started' + JSON.stringify(before) + '\n')
	
	try {
		while( pageindex <= pageAll) {	
			let result = await savePage(pageindex, allR18s);
			console.log(`${+ new Date()} : page ${pageindex} crawled \n`, { flag : 'a'})
			pageindex += 1;
		}
	} catch(e) {
		console.log(e.message)
	}
	
	await new Promise((resolve, reject) => {
		setTimeout(resolve, 0.5 * 60 * 1000);
	})
	let after = await measureR18s();
	console.log(+ new Date() + ': r18s ended'  + JSON.stringify(after) + '\n\n')
}


module.exports = crawlAndCreate;
