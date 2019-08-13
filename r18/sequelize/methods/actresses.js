const db = require('../index.js');
const { R18, Series, Studio, Actress, Category, Gallery } = db;

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




module.exports = {
	ActressesBulkCreate,
	ActressCreate,
	SyncDB
}
