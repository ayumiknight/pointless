var schedule = require('node-schedule');
var syncR18s = require('./syncR18s/syncR18Task.js');
var syncSeries = require('./syncSeries/syncSeries.js');
var syncStudios = require('./syncStudios/syncStudios.js');
var syncActresses = require('./syncActresses/syncActresses.js');
var reorderR18s = require('./reorderR18s/reorderR18s.js');
var syncRapidgator = require('./syncRapidgator/syncRapidgator.js');

var j = schedule.scheduleJob('52 14 * * *', async function() {
	await syncActresses();
	await syncStudios();
	await syncSeries();
	await syncR18s();
	await reorderR18s();
	await syncRapidgator();
});
