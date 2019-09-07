const db = require('../index.js');
const { R18, Series, Studio, Actress, Category, Gallery, RecentClick } = db;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');

const rankingOrder = [
	'jvr',
	'actress',
	'category',
	'studio'
];

async function recentClickCreate(click) {
	return RecentClick.create(click); //promise
}

//used by Ranking
async function getRecentClicksFormatted({
	days
}) {

	let clicksFormatted = rankingOrder.map( type => {
		return RecentClick.findAll({
			where: {
				createdAt: {
					[Op.gte]: moment().subtract(days, 'days').toDate()
				},
				type
			},
			group: ['clickId'],
			attributes: ['clickId', 'type', [Sequelize.fn('count', Sequelize.col('id')), 'clickCount']],
			order: [[Sequelize.literal('clickCount'), 'DESC']],
			limit: 10,
			raw: true
		})
	})
	

	clicksFormatted = await Promise.all(clicksFormatted),
		index = 0;


	while( index <= 3) {
		clicksFormatted[index] = await Promise.all(clicksFormatted[index].map((entry) => {
			return new Promise(async (resolve, reject) => {
				let data;
				switch( index) {
					case 0: 
						data = await R18.findOne({
							where: {
								id: entry.clickId
							},
							raw: true
						});
						break;
					case 1: 
						data = await Actress.findOne({
							where: {
								actress_id: entry.clickId
							},
							raw: true
						});
						break;
					case 2: 
						data = await Category.findOne({
							where: {
								category_id: entry.clickId
							},
							raw: true
						});
						break;
					case 3: 
						data = await Studio.findOne({
							where: {
								studio_id: entry.clickId
							},
							raw: true
						});
						break;
				}

				entry = {
					...data,
					...entry
				};
				resolve(entry);	
			})
			
		}))
		index++;
	}
	return clicksFormatted;
}

//used by recent clicks, update every 60s;
async function getCurrentClicks(count = 6) {
	let clicks = await RecentClick.findAll({
		where: {
			type: 'jvr'
		},
		group: ['code'],
		attributes: ['code', [Sequelize.fn('max', Sequelize.col('createdAt')), '_createdAt']],
		order: [[Sequelize.literal('_createdAt'), 'DESC']],
		limit: count,
		raw: true
	})

	return Promise.all(clicks.map(click => {
		return R18.findOne({
			where: {
				code: click.code
			}
		});
	}))
}

module.exports = {
	recentClickCreate,
	getRecentClicksFormatted,
	getCurrentClicks
}
