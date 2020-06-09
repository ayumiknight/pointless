const tryGetRapidgatorLinkJavArchive = require('./tryGetRapidgatorLinkJavArchive.js');
const tryGetRapidgatorLinkBlogJav = require('./tryGetRapidgatorLinkBlogJav.js');


async function crawlAndSaveSingle({
	code,
	R
}) {
	let javInfo = await tryGetRapidgatorLinkJavArchive({
		code
	});
	
	if (!javInfo) {
		javInfo = await tryGetRapidgatorLinkBlogJav({
			code
		});
	} else {
		console.log(`${ code } found by javarchive \n`);
	}

	if (!javInfo) {
		throw new Error(`failed to locate ${ code }======================\n`)
	} else {
		console.log(`${ code} found by blogjav \n`)
	}
	
	let myLinks = await R.saveLinksToFolder({
		name: code,
		fileLinks: javInfo.rapidgator
	});
	javInfo.rapidgator = myLinks;
	return javInfo;
}

module.exports = crawlAndSaveSingle;