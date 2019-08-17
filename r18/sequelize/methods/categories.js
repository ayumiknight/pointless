const db = require('../index.js');
const { R18, Series, Studio, Actress, Category, Gallery } = db;

async function SyncDB() {
	await db.sequelize.sync();
}

async function CategoriesBulkCreate(categories) {
	return Category.bulkCreate(categories, {
        updateOnDuplicate: ['topAdult', 'topAmateur', 'topAnime', 'en']
    }); //promise
}

async function CategoryCreate(category) {

	let category = await Category.findOrCreate({
		where: {
			category_id: category.category_id
		},
		default: category
	});
	console.log(category, '++++++++++++');
	if (!category[1]) {
		await category[0].update({
			en: category[0].en || category.en,
			zh: category[0].zh || category.zh,
			logo: category[0].logo || category.logo
		})
	}
	return category;
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
	SyncDB,
	searchForCategory
}
