const db = require('../index.js');
const { R18, Series, Studio, Actress, Category, Gallery } = db;

async function SyncDB() {
	await db.sequelize.sync();
}

async function CategoriesBulkCreate(categories) {
	return Category.bulkCreate(categories, {
        updateOnDuplicate: ['topAdult', 'topAmateur', 'topAnime']
    }); //promise
}

async function CategoryCreate(category) {

	return Category.findOrCreate({
		where: {
			category_id: category.category_id
		},
		default: category
	})
}




module.exports = {
	CategoriesBulkCreate,
	CategoryCreate,
	SyncDB
}
