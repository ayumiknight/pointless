

const { getR18WithExtraPaged } = require('../../sequelize/methods/index.js');
const { sequelize, Sequelize, Extra } = require('../../sequelize/index.js');
const crawlAndSaveSingle = require('./rapidgatorTask/crawlAndSaveSingle.js');
const Rapidgator = require('./rapidgatorTask/rapidgator.js');

let rapidgatorPageAllFromArgv = process.argv.find(one => one.match(/^--rapidgatorPage(\d+)$/))
let rapidgatorPageAll = rapidgatorPageAllFromArgv ? rapidgatorPageAllFromArgv.replace(/^--rapidgatorPage(\d+)$/i, '$1') : 5;
console.log(rapidgatorPageAll, '==========rapidgatorPageAll!!!!!!!!!!!!!!\n\n\n');
rapidgatorPageAll *= 1;


let rapidgatorPageSizeFromArgv = process.argv.find(one => one.match(/^--rapidgatorPageSize(\d+)$/))
let rapidgatorPageSize = rapidgatorPageSizeFromArgv ? rapidgatorPageSizeFromArgv.replace(/^--rapidgatorPageSize(\d+)$/i, '$1') : 20;
console.log(rapidgatorPageSize, '==========rapidgatorPageSize!!!!!!!!!!!!!!\n\n\n');
rapidgatorPageSize *= 1;

let rapidgatorCodeFromArgv = process.argv.find(one => one.match(/^--rapidgatorCode(.+)$/))
let rapidgatorCode = rapidgatorCodeFromArgv ? rapidgatorCodeFromArgv.replace(/^--rapidgatorCode(.+)$/i, '$1') : '';
console.log(rapidgatorCode, '==========rapidgatorCode!!!!!!!!!!!!!!\n\n\n');


async function syncRapidgator({
	rapidgatorPageAll,
	rapidgatorPageSize,
	rapidgatorCode,
	vr
}) {
	let page = 1;
	let pageNum = rapidgatorPageAll;

	let R = new Rapidgator();
	await R.login();


	while (page <= pageNum) {
		let rows = await getR18WithExtraPaged({
			page,
			pagesize: rapidgatorPageSize,
			code: rapidgatorCode,
			vr
		});
		rows = rows || [];

		await Promise.all(rows.filter( row => {
			let {
				id,
				Extras
			} = row;
			return row && id && !Extras;
		}).map(async row => {
			let {
				id,
				code
			} = row;

			try {
				let extras = await crawlAndSaveSingle({
					code: code.replace('-', ' '),
					R
				});
				console.log(extras, `=================extras retrieved ${code}  ${id}\n`)
				let saveExtras = await Extra.findOrCreate({
					where: {
						R18Id: id
					},
					defaults: {
						extra: JSON.stringify(extras)
					}
				});
				console.log(`${code} ${id} ${saveExtras} crawled and saved\n`);
			} catch(e) {
				console.log(`!!!!!!!!!!!!! ${code} ${id}==${e.message}\n`);
			}	
		}))
		console.log(`!!!!!!!!!!!!! page ${page} rapidgator complete`)
		page++;
	}
}

async function syncRapidgatorTask() {
	await syncRapidgator({
		rapidgatorPageAll: 5,
		rapidgatorPageSize,
		rapidgatorCode,
		vr: 1
	});
	await syncRapidgator({
		rapidgatorPageAll,
		rapidgatorPageSize,
		rapidgatorCode,
		vr: 0
	});
}

module.exports = syncRapidgatorTask;
