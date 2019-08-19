const db = require('../index.js');
const { R18, Series, Studio, Actress, Category, Gallery } = db;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

async function SyncDB() {
	await db.sequelize.sync();
}

async function StudiosBulkCreate(studios) {
	return Studio.bulkCreate(studios); //promise
}

async function StudiosCreate(studio) {

	return R18.findOrCreate({
		where: {
			studio_id: studio.studio_id
		},
		default: studio
	})
}

async function StudiosPagedByFirstLetter({
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

async function searchForStudio(search) {
	return Studio.findAndCountAll({
		where: {
			en: search
		},
		offset: 0,
		limit: 1
	})
}


module.exports = {
	StudiosBulkCreate,
	StudiosCreate,
	SyncDB,
	searchForStudio,
	StudiosPagedByFirstLetter
}
