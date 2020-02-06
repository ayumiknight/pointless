const tryGetRapidgatorLink = require('./tryGetRapidgatorLink.js');
const Rapidgator = require('./rapidgator.js');

async function crawlAndSaveSingle({
	code
}) {
	let javInfo = await tryGetRapidgatorLink({
		code
	});
	let R = new Rapidgator();
	await R.login();
	let myLinks = await R.saveLinksToFolder({
		name: code,
		fileLinks: javInfo.rapidgator
	});
	javInfo.rapidgator = myLinks;
	return javInfo;
}

module.exports = crawlAndSaveSingle;