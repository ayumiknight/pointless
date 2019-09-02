const db = require('../index.js');
const { R18, Series, Studio, Actress, Category, Gallery } = db;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

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


module.exports = {
	SeriesBulkCreate,
	SeriesCreate,
	getSearchForSeries
}
