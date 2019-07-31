const db = require('../index.js');


async function SyncDB() {
	await db.sequelize.sync();
	console.log('=======sequelize sync complete=======')
}

async function R18BulkCreate({
	entries
}) {

	let { R18, Series, Studio, Actress, Cateogry, Gallery } = db;
	await Promise.all(entries.map( entry => R18Create({ entry })));
}

async function R18Create({
	entry
}) {
	let { R18, Series, Studio, Actress, Category, Gallery } = db;
	console.log(Category, R18.Category, 'about ti unject===============')
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

}

async function R18Single(query) {
	if (!(query.id * 1)) return null;
	let { R18, Series, Studio, Actress, Category, Gallery } = db;
	return R18.findByPk(query.id);
}

module.exports = {
	R18BulkCreate,
	R18Paged,
	R18Single,
	SyncDB
}
