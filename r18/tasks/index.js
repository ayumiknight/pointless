var schedule = require('node-schedule');
var syncR18s = require('./syncR18s/syncR18Task.js');
var syncSeries = require('./syncSeries/syncSeries.js');
var syncStudios = require('./syncStudios/syncStudios.js');
var syncActresses = require('./syncActresses/syncActresses.js');
var reorderR18s = require('./reorderR18s/reorderR18s.js');
var syncRapidgator = require('./syncRapidgator/syncRapidgator.js');
var testFirst = require('./syncR18s/testFirst.js');


module.exports = async function crawl() {
	let {
		needActress,
        needStudio,
        needSeries
	} = await testFirst();
	if (needActress) {
		await syncActresses();
	}
	if (needStudio) {
		await syncStudios();
	}
	if (needSeries) {
		await syncSeries();
	}
	await syncR18s();
	await reorderR18s();
	await syncRapidgator();
};