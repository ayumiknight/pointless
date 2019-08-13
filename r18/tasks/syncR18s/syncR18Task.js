

const { R18BulkCreate, SyncDB } = require('../sequelize/methods/r18.js');
const generateData = require('../crawler/index.js');
const fs = require('fs');

let pageAll = 1;
async function crawlAndCreate() {
	await SyncDB();
	let pageindex = 1;
	while( pageindex <= pageAll) {
		let formattedEntries = await generateData(pageindex);
		console.log(`=======${pageindex} crawled=====`)
		fs.writeFileSync(`./crawled${pageindex}.txt`, JSON.stringify(formattedEntries));
		let buldSavingResult = await R18BulkCreate({
			entries: formattedEntries
		});
		console.log(`=======${pageindex} saved=====`)
		i++;
	}
}


crawlAndCreate();
