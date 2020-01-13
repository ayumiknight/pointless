var schedule = require('node-schedule');
var syncR18s = require('./syncR18s/syncR18Task.js');
var syncSeries = require('./syncSeries/syncSeries.js');
var syncStudios = require('./syncStudios/syncStudios.js');
var syncActresses = require('./syncActresses/syncActresses.js');


async function do() {
	await syncActresses();
	await syncStudios();
	await syncSeries();
	await syncR18s();
}

do();