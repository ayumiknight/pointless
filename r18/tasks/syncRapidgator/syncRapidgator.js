

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
			if (!vr ) {
				if (!extra) return true
				if (!extra.rapidgator || !extra.rapidgator.length) {
					return true
				}
			} else {
				if (!row.source) return true
				if (!row.source.tez || !row.source.tez.length) {
					return true
				}
				if ((row.source.tez || []).length > (row.source.jpOrgK2s || []).length) {
					return true
				}
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
		source,
		Extras,
		extra
	} = row;

	try {
		let extras = await crawlAndSaveSingle({
			code,
			R,
			vr,
			source,
			extra,
			P
		});
		if (!vr) {
			if (!extras.rapidgator.length) {
				console.log(`nonvr ${code} not found++++++++++++`)
				return
			}
			const ExtraInfo = {
				extra: JSON.stringify({
					rapidgator: extras.rapidgator,
					k2s: extras.k2s || []
				})
			}
			await Extra.findOrCreate({
				where: {
					R18Id: id
				},
				defaults: ExtraInfo
			});
		} else {
			let dirty = false
			extras.tez.length && (source.tez = extras.tez) && (dirty = true)
			extras.jpOrgK2s.length && (source.jpOrgK2s = extras.jpOrgK2s) && (dirty = true)
			if (!dirty) {
				if (!source.tez.length) {
					console.log(`vr ${code} not found++++++++++++`)
				} else {
					console.log(`vr ${code} not updated++++++++++++`)
				}
				return
			}
			if (!Extras) {
				await Extra.findOrCreate({
					where: {
						R18Id: id
					},
					defaults: {
						source: JSON.stringify(source)
					}
				});
			} else {
				await Extra.update({
					source: JSON.stringify(source)
				}, {
					where: {
						R18Id: id
					},
					silent: true
				});
			}			
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
