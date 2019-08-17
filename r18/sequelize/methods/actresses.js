const db = require('../index.js');
const { R18, Series, Studio, Actress, Category, Gallery } = db;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

async function SyncDB() {
	await db.sequelize.sync();
}

async function ActressesBulkCreate(actresses) {
	return Actress.bulkCreate(actresses); //promise
}

async function ActressCreate(actress) {

	return Actress.findOrCreate({
		where: {
			actress_id: actress.actress_id
		},
		default: actress
	})
}

async function ActressesPagedByFirstLetter({
	firstLetter,
	pageindex,
	pagesize
}) {
	return Actress.findAndCountAll({
		where: {
			en: {
				[Op.like]: `${firstLetter}%`
			}
		},
		offset: (pageindex - 1) * pagesize,
		limit: pagesize
	})
}

async function searchForActress(search) {
	return Actress.findAndCountAll({
		where: {
			en: search
		},
		offset: 0,
		limit: 1
	})
}

module.exports = {
	ActressesBulkCreate,
	ActressCreate,
	ActressesPagedByFirstLetter,
	searchForActress,
	SyncDB
}
