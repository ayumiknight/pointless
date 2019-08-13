const db = require('../index.js');
const { R18, Series, Studio, Actress, Category, Gallery } = db;

async function SyncDB() {
	await db.sequelize.sync();
}

async function SeriesBulkCreate(serieses) {
	return Series.bulkCreate(serieses); //promise
}

async function SeriesCreate(series) {

	return Series.findOrCreate({
		where: {
			series_id: series.series_id
		},
		default: series
	})
}




module.exports = {
	SeriesBulkCreate,
	SeriesCreate,
	SyncDB
}
