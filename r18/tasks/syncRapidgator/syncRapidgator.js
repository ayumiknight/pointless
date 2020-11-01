

const { getR18WithExtraPaged } = require('../../sequelize/methods/r18.js');
const { sequelize, Sequelize, Extra } = require('../../sequelize/index.js');
const crawlAndSaveSingle = require('./rapidgatorTask/crawlAndSaveSingle.js');
const Rapidgator = require('./rapidgatorTask/rapidgator.js');

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
	R
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
			if (row.Extras) {
				row.extra = JSON.parse(row.Extras.extra)
			}
			return row;
		}).filter( row => {
			let {
				id,
				extra
			} = row;
			if (!extra) {
				row.needK2s = true;
				row.needRp = true;
				return true;
			}
			if (extra.noSync) {
				return false;
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
					vr
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
	vr
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
			extra
		});
		if (!row.extra) {
			await Extra.findOrCreate({
				where: {
					R18Id: id
				},
				defaults: {
					extra: JSON.stringify(extras)
				}
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

	await syncRapidgator({
		rapidgatorPageAll: 5,
		rapidgatorPageSize,
		rapidgatorCode,
		vr: 1,
		R
	});
	await syncRapidgator({
		rapidgatorPageAll,
		rapidgatorPageSize,
		rapidgatorCode,
		vr: 0,
		R
	});
}

module.exports = syncRapidgatorTask;
