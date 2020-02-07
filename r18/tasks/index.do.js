var schedule = require('node-schedule');
var syncR18s = require('./syncR18s/syncR18Task.js');
var syncSeries = require('./syncSeries/syncSeries.js');
var syncStudios = require('./syncStudios/syncStudios.js');
var syncActresses = require('./syncActresses/syncActresses.js');
var reorderR18s = require('./reorderR18s/reorderR18s.js');
var syncRapidgator = require('./syncRapidgator/syncRapidgator.js');

var fs = require('fs');
var log_file = fs.createWriteStream(__dirname + `/${+new Date()}debug.log`, {flags : 'w'});

var fn = process.stdout.write;
function write() {
  fn.apply(process.stdout, arguments);
  log_file.write.apply(log_file, arguments);
}
process.stdout.write = write;

async function doIt() {
	await syncActresses();
	await syncStudios();
	await syncSeries();
	await syncR18s();
	await reorderR18s();
	await syncRapidgator();
}

doIt();