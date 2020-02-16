

const { getR18WithExtraPaged, tagR18sWithTorrent } = require('../../sequelize/methods/index.js');


var fs = require('fs');
var log_file = fs.createWriteStream(__dirname + `/${+new Date()}debug.log`, {flags : 'w'});

var fn = process.stdout.write;
function write() {
  fn.apply(process.stdout, arguments);
  log_file.write.apply(log_file, arguments);
}
process.stdout.write = write;
const TorrentSearchApi = require('torrent-search-api');
TorrentSearchApi.enableProvider('Torrentz2');

async function syncTorrents(all) {
	let page = 1;
	let pageNum = all ? 350 : 100;

	while (page <= pageNum) {
		let rows = await getR18WithExtraPaged({
			page,
			pagesize: 20
		});
		rows = rows || [];
		let index = 0;
		while(index <= rows.length -1 ) {
			let row = rows[index];
			if (row.torrent * 1 != 1) {
				console.log('looking for', row.code, '==============\n');
				let torrents = await TorrentSearchApi.search(row.code, 'All', 1);
				let torrent = torrents[0] || {},
				title = torrent.title;
			
				let [letter, number ] = row.code.split('-');
				if (title && title.match(letter) && title.match(number)) {
					await tagR18sWithTorrent(row.code)
					console.log('found and marked', row.code, '==============\n');
				}
			}
			index++;
		}
		page++;
	}
}


syncTorrents(true);

