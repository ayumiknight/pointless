const TorrentSearchApi = require('torrent-search-api');
 
TorrentSearchApi.enableProvider('Torrentz2');

// Search '1080' in 'Movies' category and limit to 20 results
async function boot() {
	const torrents = await TorrentSearchApi.search('exvr-113', 'All', 20);
	console.log(torrents,'======')
}

boot();
