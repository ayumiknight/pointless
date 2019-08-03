const db = require('../index.js');
const { R18, Series, Studio, Actress, Category, Gallery } = db;

async function SyncDB() {
	await db.sequelize.sync();
}

async function R18BulkCreate({
	entries
}) {
	await Promise.all(entries.map( entry => R18Create({ entry })));
}

async function R18Create({
	entry
}) {

	await R18.create(entry, {
		include: [{
			model: Category,
			as: 'Categories'
		}, {
			association: R18.Actresses,
			as: 'Actresses'
		}, {
			association: R18.Series
		}, {
			association: R18.Studio
		},{
			association: R18.Galleries,
			as: 'Galleries'
		}]
	})
}


async function R18Paged(query) {
	let { 
		actress_id, 
		category_id, 
		series_id, 
		studio_id, 
		page_index,
		page_size 
	} = query;

	return R18.findAll({
		offset: (page_index - 1) * page_size,
		limit: page_size,
		include: [{
			model: Category,
			as: 'Categories'
		}, {
			association: R18.Actresses,
			as: 'Actresses'
		}, {
			association: R18.Series
		}, {
			association: R18.Studio
		},{
			association: R18.Galleries,
			as: 'Galleries'
		}]
	})
	if (actress_id) {
		return R18.find({
		    offset: 0,
		    limit: 10,
		    include: [{
		        model: Category,
		        where: [
		            '`Categories.CityCategory`.`year` = 2015'
		        ],
		        attributes: ['id', 'name', 'year']
		    }]
		})
	}

}

async function R18Single(query) {
	if (!(query.id * 1)) return null;
	
	return R18.findByPk(query.id);
}

module.exports = {
	R18BulkCreate,
	R18Paged,
	R18Single,
	SyncDB
}
