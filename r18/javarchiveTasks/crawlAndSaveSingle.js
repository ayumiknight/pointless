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
	console.log(myLinks)
}

async function test() {
	let R = new Rapidgator();
	await R.login();
	let myLinks = await R.saveLinksToFolder({
		name: 'TPPN123123',
		fileLinks: [
			'https://rapidgator.net/file/a29bfe0c801a518a9e9c018ad33c9b75/TPPN-035.mp4.html'
		]
	});
	console.log(myLinks, '========')
}

test();
// crawlAndSaveSingle({
// 	code: 'TPPN 035'
// })