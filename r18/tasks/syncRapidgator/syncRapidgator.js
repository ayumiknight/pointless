

const { getR18WithExtraPaged } = require('../../sequelize/methods/index.js');
const { sequelize, Sequelize, Extra } = require('../../sequelize/index.js');
const crawlAndSaveSingle = require('./rapidgatorTask/crawlAndSaveSingle.js');

var fs = require('fs');
var log_file = fs.createWriteStream(__dirname + `/${+new Date()}debug.log`, {flags : 'w'});

var fn = process.stdout.write;
function write() {
  fn.apply(process.stdout, arguments);
  log_file.write.apply(log_file, arguments);
}
process.stdout.write = write;


async function syncRapidgator() {
	let page = 1;
	let pageNum = process.argv.find(one => {
		return one == '-all'
	}) ? 349 : 5;
	let rows = await getR18WithExtraPaged({
		page,
		pagesize: 10
	});	
	while (page <= pageNum) {
		let rows = await getR18WithExtraPaged({
			page,
			pagesize: 20
		});
		rows = rows || [];
		let index = 0;
		while(index <= rows.length -1 ) {
			let row = rows[index],
				{ id, Extras, code } = rows[index] || {};

			if (row && id && !Extras) {
				try {
					let extras = await crawlAndSaveSingle({
						code: code.replace('-', ' ')
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
			}
			index++;
		}
		page++;
	}
}



module.exports = syncRapidgator;
