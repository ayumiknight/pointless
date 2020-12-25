

const { getR18WithExtraPaged } = require('../../sequelize/methods/r18.js');
const { sequelize, Sequelize, Extra } = require('../../sequelize/index.js');
const crawlAndSaveSingle = require('./rapidgatorTask/crawlAndSaveSingle.js');
const Rapidgator = require('./rapidgatorTask/rapidgator.js');
const PuppeteerMD5Fetcher = require('./rapidgatorTask/puppeteerMD5Fetcher');
let rapidgatorPageAllFromArgv = process.argv.find(one => one.match(/^--rapidgatorPage(\d+)$/))
let rapidgatorPageAll = rapidgatorPageAllFromArgv ? rapidgatorPageAllFromArgv.replace(/^--rapidgatorPage(\d+)$/i, '$1') : 10;
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
	vr,
	R,
	P
}) {
	let page = 1;
	let pageNum = rapidgatorPageAll;



	while (page <= pageNum) {
		let rows = await getR18WithExtraPaged({
			page,
			pagesize: rapidgatorPageSize,
			code: rapidgatorCode,
			vr
		});
		rows = rows || [];

		const taskRows = rows.map(row => {
			if (row.Extras && row.Extras.extra) {
				row.extra = JSON.parse(row.Extras.extra)
			}
			if (row.Extras && row.Extras.source) {
				row.source = JSON.parse(row.Extras.source)
			}
			return row;
		}).filter( row => {
			let {
				id,
				extra,
				source = {}
			} = row;
			if (source.noSync) {
				return false;
			}
			if (!extra) {
				row.needK2s = true;
				row.needRp = true;
				return true;
			}
			row.needK2s = !extra.k2s || !extra.k2s.length;
			row.needRp = !extra.rapidgator || !extra.rapidgator.length;
			if (row.needK2s || row.needRp) {
				return true
			}
			return false;
		})
			
		while(taskRows.length) {
			let first = taskRows.pop();
			let second = taskRows.pop();
			await Promise.all([first, second].filter(el => !!el).map(el => {
				return syncRapidgatorSingle({
					row: el,
					R,
					vr,
					P
				})
			}))
		}
		console.log(`!!!!!!!!!!!!! page ${page} download links complete`)
		page++;
	}
}

async function syncRapidgatorSingle({
	row,
	R,
	vr,
	P
}) {
	let {
		id,
		code,
		needK2s,
		needRp,
		extra
	} = row;

	try {
		let extras = await crawlAndSaveSingle({
			code,
			R,
			vr,
			needK2s,
			needRp,
			extra,
			P
		});
		if (!row.extra) {
			const ExtraInfo = {}
			if (extras.partialOk) {
				ExtraInfo.partialOk = 1
			}
			if (extras.tez && extras.tez.length) {
				ExtraInfo.source = JSON.stringify({
					tez: extras.tez
				})
			}
			delete(extras.partialOk);
			delete(extras.tez)
			
			if (extras.k2s.length || extras.rapidgator.length) {
				ExtraInfo.extra = JSON.stringify(extras);
			}
			
			await Extra.findOrCreate({
				where: {
					R18Id: id
				},
				defaults: ExtraInfo
			});
		} else {
			const patch = {
				javarchiveHref: extras.javarchiveHref,
				avcensHref: extras.avcensHref
			}
			needK2s && extras.k2s.length && (patch.k2s = extras.k2s)
			needRp && extras.rapidgator.length && (patch.rapidgator = extras.rapidgator)
			
			await Extra.update({
				extra: JSON.stringify({
					...row.extra,
					...patch
				})
			}, {
				where: {
					R18Id: id
				}
			})
		}
		
		console.log(`${code} ${id} crawled and saved\n`);
	} catch(e) {
		console.log(`!!!!!!!!!!!!! ${code} ${id}==${e.message}\n`, e);
	}	
}
async function syncRapidgatorTask() {
	let R = new Rapidgator();
	await R.login();
	try {
		let P = new PuppeteerMD5Fetcher({});
		await P.init();

		await syncRapidgator({
			rapidgatorPageAll: 8,
			rapidgatorPageSize,
			rapidgatorCode,
			vr: 1,
			R,
			P
		});
		await syncRapidgator({
			rapidgatorPageAll,
			rapidgatorPageSize,
			rapidgatorCode,
			vr: 0,
			R,
			P
		});
		await P.destory()
	} catch(e) {
		try {
			await P.destory()
		} catch(e) {}
	}
}

module.exports = syncRapidgatorTask;
