

const { getR18WithExtraPaged } = require('../../sequelize/methods/r18.js');
const syncRapidgatorSingle = require('./rapidgatorTask/syncRapidgatorSingle');
const PreScanAvcens = require('./rapidgatorTask/preScanAvcens.js');
const Rapidgator = require('./rapidgatorTask/rapidgator.js');
const PuppeteerMD5Fetcher = require('./rapidgatorTask/puppeteerMD5Fetcher');
let rapidgatorPageAllFromArgv = process.argv.find(one => one.match(/^--rapidgatorPage(\d+)$/))
let rapidgatorPageAll = rapidgatorPageAllFromArgv ? rapidgatorPageAllFromArgv.replace(/^--rapidgatorPage(\d+)$/i, '$1') : 20;
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
			if (!vr ) {
				if (!extra) return true
				if (!extra.rapidgator || !extra.rapidgator.length) {
					return true
				}
			} else {
				return true
				// if (!row.source) return true
				// if (!row.source.tez || !row.source.tez.length) {
					
				// }
				// if ((row.source.tez || []).length > (row.source.jpOrgK2s || []).length) {
				// 	return true
				// }
			}
			return false;
		})
			
		while(taskRows.length) {
			let first = taskRows.pop();
			await new Promise(async (resolve) => {
				const timeOut = setTimeout(() => {
					console.log(`${first.code} sync timeout 60 * 1000`)
					resolve()
				}, 60 * 1000)
				await syncRapidgatorSingle({
					row: first,
					R,
					vr,
					P
				})
				clearTimeout(timeOut)
				resolve()
			})
		}
		console.log(`!!!!!!!!!!!!! page ${page} download links complete`)
		page++;
	}
}

async function syncRapidgatorTask() {
	let R = new Rapidgator();
	await R.login();
	try {
		let P = new PuppeteerMD5Fetcher({});
		await P.init();

		let preScan = new PreScanAvcens({
			R,
			P
		})
		await preScan.scan(3);

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
