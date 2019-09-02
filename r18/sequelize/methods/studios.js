const db = require('../index.js');
const { R18, Series, Studio, Actress, Category, Gallery } = db;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

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


module.exports = {
	StudiosBulkCreate,
	StudiosCreate,
	getSearchForStudio,
	getStudiosPagedByFirstLetter
}
