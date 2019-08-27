const db = require('../index.js');
const { R18, Message } = db;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');

async function writeMessages(messages) {
	return Message.bulkCreate(messages);
}

async function getRecentMessages({
	mins = 10,
	limit = 100,
	room = 'Jvr'
}) {
	
	return Message.findAndCountAll({
		where: {
			createdAt: {
				[Op.gte]: moment().subtract(mins, 'minutes').toDate()
			},
			room
		},
		limit
	})
}

module.exports = {
	writeMessages,
	getRecentMessages
}
