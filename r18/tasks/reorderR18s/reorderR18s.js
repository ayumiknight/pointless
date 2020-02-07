
const { sequelize, Sequelize } = require('../../sequelize/index.js');


//every day crawled entries are newest to oldest,
// in db highid ================> lowid
// oldestday1 => newestday1, oldestday2 => newestday2,
// use order to keep them the same order as original

async function reorderR18s() {
	let results = await Promise.all([
		sequelize.query('SELECT id,`order`,createdAt FROM R18s WHERE `order` IS null ORDER BY id DESC'),
		sequelize.query('SELECT id,`order`,createdAt FROM R18s WHERE `order` IS NOT null ORDER BY `order` ASC limit 1')
	]);

	let rowsToUpdate = results[0] && results[0][0],
		previousOrder = results[1] && results[1][0] && results[1][0][0];

	if (rowsToUpdate.length > 0 && previousOrder && previousOrder.order) {

		let lowId = rowsToUpdate[rowsToUpdate.length -1].id,
			highId = rowsToUpdate[0].id,
			orderStart = previousOrder.order - 1;

		let updateResult = await sequelize.query(`UPDATE R18s set \`order\` = id + (${orderStart - highId}) WHERE id BETWEEN ${lowId} AND ${highId}`);
	}
}

module.exports = reorderR18s;