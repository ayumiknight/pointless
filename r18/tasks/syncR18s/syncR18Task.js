

const { R18BulkCreate, R18Create,  SyncDB } = require('../../sequelize/methods/r18.js');
const generateData = require('./syncR18s.js');
var fs = require('fs');
var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) { //
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};
let pageAll = 200;
async function crawlAndCreate() {
	await SyncDB();
	let pageindex = 61;
	while( pageindex <= pageAll) {
		let formattedEntries = await generateData(pageindex);
		console.log('\x1b[32m%s\x1b[0m', `crawiling=====================${pageindex} saved=====!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`)
		fs.writeFileSync(`./crawled${pageindex}.txt`, JSON.stringify(formattedEntries));
		try {
			let buldSavingResult = await R18BulkCreate({
				entries: formattedEntries
			});
		} catch(e) {

		}
		
		console.log('\x1b[32m%s\x1b[0m', `!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!=======${pageindex} saved=====!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`)
		pageindex += 1;

	}
	await new Promise((resolve, reject) => {
		setTimeout(resolve, 30 * 1000);
	})
}


crawlAndCreate();
