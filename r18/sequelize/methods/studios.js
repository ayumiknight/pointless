const db = require('../index.js');
const { R18, Series, Studio, Actress, Category, Gallery, sequelize } = db;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

async function StudiosBulkCreate(studios) {
	return Promise.all(studios.map(studio => {
		return StudiosCreate(studio)
	})) //promise
}

async function StudiosCreate(studio) {

	return Studio.findOrCreate({
		where: {
			studio_id: studio.studio_id
		},
		defaults: studio
	})
}

async function getStudiosPagedByFirstLetter({
	firstLetter,
	pageindex,
	pagesize
}) {
	return Studio.findAndCountAll({
		where: {
			en: {
				[Op.like]: `${firstLetter}%`
			}
		},
		offset: (pageindex - 1) * pagesize,
		limit: pagesize
	})
}

async function getSearchForStudio(search) {
	return Studio.findOne({
		where: {
			[Op.or]: [{
				zh: search
			}, {
				en: search
			}]	
		}
	})
}

async function measureStudios() {
	return sequelize.query("SELECT COUNT(DISTINCT(`studio_id`)) FROM `Studios`;")
}

module.exports = {
	StudiosBulkCreate,
	StudiosCreate,
	getSearchForStudio,
	getStudiosPagedByFirstLetter,
	measureStudios
}
