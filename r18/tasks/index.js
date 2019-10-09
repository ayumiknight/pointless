var schedule = require('node-schedule');
var syncR18s = require('./syncR18s/syncR18Task.js');
var syncSeries = require('./syncSeries/syncSeries.js');
var syncStudios = require('./syncStudios/syncStudios.js');
var syncActresses = require('./syncActresses/syncActresses.js');

var j = schedule.scheduleJob('52 14 * * *', async function() {
	await syncActresses();
	await syncStudios();
	await syncSeries();
	await syncR18s();
});
