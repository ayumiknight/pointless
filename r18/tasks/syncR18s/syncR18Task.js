

const { R18BulkCreate, R18Create,  SyncDB, measureR18s } = require('../../sequelize/methods/index.js');
const generateData = require('./syncR18s.js');
var fs = require('fs');
var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;


let pageAll = 203;
async function crawlAndCreate() {
	await SyncDB();
	let before = await measureR18s();
	await fs.writeFileSync('./result.txt', JSON.stringify(before) + '\n', { flag : 'a'})
	let pageindex = 1;
	while( pageindex <= pageAll) {

		let formattedEntries = await generateData(pageindex);
		fs.writeFileSync(`./crawled${pageindex}.txt`, JSON.stringify(formattedEntries));
		try {
			let buldSavingResult = await R18BulkCreate({
				entries: formattedEntries
			});
			await fs.writeFileSync('./result.txt', `${+new Date()} : page ${pageindex} crawled \n`, { flag : 'a'})
		} catch(e) {
			await fs.writeFileSync('./result.txt', `${+new Date()} : ` + (e.message || e.msg) + `error at page ${pageindex}!!!! \n`, { flag : 'a'})
		}
		pageindex += 1;

	}
	await new Promise((resolve, reject) => {
		setTimeout(resolve, 0.5 * 60 * 1000);
	})
	let after = await measureR18s();
	await fs.writeFileSync('./result.txt', JSON.stringify(after) + '\n\n', { flag : 'a'})
}


crawlAndCreate();
