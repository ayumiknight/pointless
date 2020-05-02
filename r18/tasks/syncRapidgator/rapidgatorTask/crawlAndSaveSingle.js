const tryGetRapidgatorLinkJavArchive = require('./tryGetRapidgatorLinkJavArchive.js');
//const tryGetRapidgatorLinkFansJav = require('./tryGetRapidgatorLinkFansJav.js');


async function crawlAndSaveSingle({
	code,
	R
}) {
	let javInfo = await tryGetRapidgatorLinkJavArchive({
		code
	});
	let myLinks = await R.saveLinksToFolder({
		name: code,
		fileLinks: javInfo.rapidgator
	});
	javInfo.rapidgator = myLinks;
	return javInfo;
}

module.exports = crawlAndSaveSingle;