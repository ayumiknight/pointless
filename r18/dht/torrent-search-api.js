const TorrentSearchApi = require('torrent-search-api');
 
TorrentSearchApi.enableProvider('Torrentz2');
//TorrentSearchApi.enableProvider('Torrent9');
TorrentSearchApi.enableProvider('1337x');
// TorrentLeech: cookie authentification
// IpTorrents: credentials and cookie authentification
// Torrent9
// Torrentz2
// 1337x
// ThePirateBay
// YggTorrent : credentials and cookie authentification
// KickassTorrents
// Rarbg
// TorrentProject
// ExtraTorrent
// Search '1080' in 'Movies' category and limit to 20 results
async function boot() {
	const torrents = await TorrentSearchApi.search('PYDVR-012', 'All', 20);
	console.log(torrents,'======')
}

boot();
