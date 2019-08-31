const db = require('../index.js');
const { R18, Series, Studio, Actress, Category, Gallery } = db;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

async function SyncDB() {
	await db.sequelize.sync();
}

async function CategoriesBulkCreate(categories) {
	return Category.bulkCreate(categories, {
        updateOnDuplicate: ['topAdult', 'topAmateur', 'topAnime', 'en', 'zh', 'logo', 'fromAdult']
    }); //promise
}

async function CategoryCreate(category) {

	let category = await Category.findOrCreate({
		where: {
			category_id: category.category_id
		},
		default: category
	});

	if (!category[1]) {
		await category[0].update({
			en: category[0].en || category.en,
			zh: category[0].zh || category.zh,
			logo: category[0].logo || category.logo
		})
	}
	return category;
}

async function CategoryPaged({
	CategoryPaged
}) {
	let raw = await Category.findAndCountAll({
		where: {
			fromAdult: 1,
			category_id: {
				[Op.notIn]: [6613, 6614, 6615, 6619, 6620, 6621, 6671, 6793, 6925, 1000022, 10000164]
			}
		}
	});

	return {
		"Top Categories": raw.rows.filter( a => a.topAdult),
		"Situation": raw.rows.filter( a => a.parent === 1),
		"Type": raw.rows.filter( a => a.parent === 2),
		"Costume": raw.rows.filter( a => a.parent === 3),
		"Genre": raw.rows.filter( a => a.parent === 4),
		"Play": raw.rows.filter( a => a.parent === 5),
		'Other': raw.rows.filter( a => a.parent === 6)
	};
}

async function searchForCategory(search) {
	return Category.findAndCountAll({
		where: {
			en: search
		},
		offset: 0,
		limit: 1
	})
}


module.exports = {
	CategoriesBulkCreate,
	CategoryCreate,
	CategoryPaged,
	SyncDB,
	searchForCategory
}
