const allEntries = require('./rapidgatorTask/1581080322580allFiles.log');
const { getR18WithExtraPaged } = require('../../sequelize/methods/index.js');
const { sequelize, Sequelize, Extra } = require('../../sequelize/index.js');
const Rapidgator = require('./rapidgatorTask/rapidgator.js');


var fs = require('fs');
var log_file = fs.createWriteStream(__dirname + `/${+new Date()}debug.log`, {flags : 'w'});

var fn = process.stdout.write;
function write() {
  fn.apply(process.stdout, arguments);
  log_file.write.apply(log_file, arguments);
}
process.stdout.write = write;

let totalEntries = allEntries.length;
console.log(totalEntries, 'totalEntries=======================');

async function syncRapidgator(all) {
	let page = 1;
	let pageNum = all ? 350 : 5;

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
					let match = [],
						[lcode, coden] = code.split('-'),
						reg1 = new RegExp(lcode, 'i'),
						reg2 = new RegExp(coden);
					
					for(let i = 0; i < totalEntries; i ++) {
						let entry = allEntries[i].split("/").pop();
						if (reg1.exec(entry) && reg2.exec(entry)) {
							match.push(allEntries[i]);
						}
					}

					if (!match.length) {
						throw new Error(`no entries found`)
					}

					const R = new Rapidgator();
					await R.login();

					let myLinks = await R.saveLinksToFolder({
						name: code,
						fileLinks: match
					});

					if (myLinks.length) {
						let saveExtras = await Extra.findOrCreate({
							where: {
								R18Id: id
							},
							defaults: {
								extra: JSON.stringify({
									rapidgator: myLinks
								}),
								partialOK: myLinks.length == match.length ? 0 : 1,
								syncFrom: 1
							}
						});
						console.log(`${code} ${id} ${saveExtras} crawled and saved\n`);
					} else {
						throw new Error(`all entries expired`);
					}
					
					
				} catch(e) {
					console.log(`!!!!!!!!!!!!! ${code} ${id}==${e.message}\n`);
				}	
			}
			index++;
		}
		page++;
	}
}



syncRapidgator(true);

