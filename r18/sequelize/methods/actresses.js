const db = require('../index.js');
const { R18, Series, Studio, Actress, Category, Gallery, sequelize } = db;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

async function ActressesBulkCreate(actresses) {
	return Promise.all(actresses.map(actress => {
		return ActressCreate(actress)
	})); //promise
}

async function ActressCreate(actress) {
	const _actress = await Actress.findOne({
		where: {
			actress_id: actress.actress_id
		}
	})
	if (_actress) {
		await _actress.update(actress)
	} else {
		await Actress.create(actress)
	}
}

async function getActressesPagedByFirstLetter({
	firstLetter,
	pageindex,
	pagesize,
	nonVR
}) {
	return Actress.findAndCountAll({
		where: {
			en: {
				[Op.like]: `${firstLetter}%`
			}
		},
		offset: (pageindex - 1) * pagesize,
		limit: pagesize,
		include: [{
			model: R18,
			as: 'R18s',
			where: {
				vr: nonVR ? 0 : 1
			}
		}],
		distinct: true
	})
}

async function getSearchForActress(search) {
	return Actress.findOne({
		where: {
			[Op.or]: [{
				zh: search
			}, {
				en: search
			}]	
		}
	})
}

async function getActressById(id) {
	return Actress.findByPk(id);
}

async function measureActresses() {
	return sequelize.query("SELECT COUNT(DISTINCT(`actress_id`)) FROM `Actresses`;")
}

module.exports = {
	ActressesBulkCreate,
	ActressCreate,
	getActressesPagedByFirstLetter,
	getSearchForActress,
	getActressById,
	measureActresses
}
