const db = require('../index.js');
const { R18, Series, Studio, Actress, Category, Gallery } = db;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

async function CategoriesBulkCreate(categories) {
	return Category.bulkCreate(categories, {
        updateOnDuplicate: ['topAdult', 'topAmateur', 'topAnime', 'en', 'zh', 'logo', 'fromAdult']
    }); //promise
}

async function CategoryCreate(category) {
	const _category = await Category.findOne({
		where: {
			category_id: category.category_id
		}
	})
	if (_category) {
		await _category.update({
			en: _category.en || category.en,
			zh: _category.zh || category.zh,
			logo: _category.logo || category.logo
		})
	} else {
		await Category.create(category)
	}
}

async function getCategoryPaged({
	zh
}) {
	let raw = await Category.findAndCountAll({
		where: {
			fromAdult: 1
		}
	});

	if (zh) {
		return {
			"热门": raw.rows.filter( a => a.topAdult),
			"类别": raw.rows.filter( a => a.parent === 1),
			"类型": raw.rows.filter( a => a.parent === 2),
			"服装": raw.rows.filter( a => a.parent === 3),
			"种类": raw.rows.filter( a => a.parent === 4),
			"Play": raw.rows.filter( a => a.parent === 5),
			'其他': raw.rows.filter( a => a.parent === 6)
		};
	}
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

async function getSearchForCategory(search) {
	return Category.findOne({
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
	CategoriesBulkCreate,
	CategoryCreate,
	getCategoryPaged,
	getSearchForCategory
}
