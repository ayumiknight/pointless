const Rapidgator = require('./rapidgatorTask/rapidgator.js');


var fs = require('fs');
var log_file = fs.createWriteStream(__dirname + `/${+new Date()}debug.log`, {flags : 'w'});

var fn = process.stdout.write;
function write() {
  fn.apply(process.stdout, arguments);
  log_file.write.apply(log_file, arguments);
}
process.stdout.write = write;

var folders = require('./folders');

async function cleanAll() {
	let R = new Rapidgator();
	await R.login();


	let foldersToDelete = folders.response.folder.folders || [],
		index = 0;

	while (index < foldersToDelete.length) {
		console.log(`deleting ${foldersToDelete[index].folder_id} \n`)
		await R.deleteFolder({
			folderId: foldersToDelete[index].folder_id
		});
		console.log(`${foldersToDelete[index].folder_id} deleted\n`)
		index++
	}
}

cleanAll();

module.exports = cleanAll;