const db = require('../index.js');
const { R18, Series, Studio, Actress, Category, Gallery, sequelize } = db;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

async function SeriesBulkCreate(serieses) {
	return Promise.all(serieses.map(series => {
		return SeriesCreate(series);
	})); //promise
}

async function SeriesCreate(series) {
	const _series = await Series.findOne({
		where: {
			series_id: series.series_id
		}
	})
	if (_series) {
		await _series.update(series)
	} else {
		await Series.create(series)
	}
}


async function getSearchForSeries(search) {
	return Series.findOne({
		where: {
			[Op.or]: [{
				zh: search
			}, {
				en: search
			}]	
		}
	})
	
}

async function measureSeries() {
	return sequelize.query("SELECT COUNT(DISTINCT(`series_id`)) FROM `Series`;")
}


module.exports = {
	SeriesBulkCreate,
	SeriesCreate,
	getSearchForSeries,
	measureSeries
}
