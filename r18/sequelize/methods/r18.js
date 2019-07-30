async function R18BulkCreate({
	db,
	entries
}) {

	let { R18, Series, Studio, Actress, Cateogry, Gallery } = db;
	await Promise.all(entries.map( entry => R18Create({db, entry})));
}

async function R18Create({
	db,
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

module.exports = {
	R18BulkCreate
}
