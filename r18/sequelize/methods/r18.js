const db = require('../index.js');
const { R18, Series, Studio, Actress, Category, Gallery } = db;

//never use bulkcreate, mysql won't return primary ids for bulk insert!!!

async function SyncDB() {
	await db.sequelize.sync();
}

async function R18BulkCreate({
	entries
}) {
	await Promise.all(entries.map( entry => R18Create({ entry })));
}

async function R18Create({
	entry
}) {
	let [r18, created] = await R18.findOrCreate({
		where: {
			code: entry.code
		},
		defaults: entry
	});

	let [ 
		categories, 
		actresses,
		series,
		studio,
		galleries
	] = await Promise.all([
		Promise.all((entry.Categories || []).map(cate => Category.findOrCreate({
			where: {
				category_id: cate.category_id
			},
			defaults: cate
		}))),
		Promise.all((entry.Actresses || []).map(actress => Actress.findOrCreate({
			where: {
				actress_id: actress.actress_id
			},
			defaults: actress
		}))),
		entry.Series ? Series.findOrCreate({
			where: {
				series_id: entry.Series.series_id
			},
			defaults: entry.Series
		}) : null,
		entry.Studio ? Studio.findOrCreate({
			where: {
				studio_id: entry.Studio.studio_id
			},
			defaults: entry.Studio
		}) : null,

		Promise.all((entry.Galleries || []).map(gallery => Gallery.findOrCreate({
			where: {
				url: gallery.url
			},
			defaults: gallery
		})))
	])

	await Promise.all([
		r18.setCategories(categories.map( category => category[0])),
		r18.setActresses(actresses.map( actress => actress[0])),
		series && r18.setSeries(series[0]),
		studio && r18.setStudio(studio[0]),
		r18.setGalleries(galleries.map( gallery => gallery[0]))
	])
}


async function R18Paged(query) {
	let { 
		actress_id, 
		category_id, 
		series_id, 
		studio_id, 
		page_index,
		page_size 
	} = query;

	return R18.findAll({
		offset: (page_index - 1) * page_size,
		limit: page_size,
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
	if (actress_id) {
		return R18.find({
		    offset: 0,
		    limit: 10,
		    include: [{
		        model: Category,
		        where: [
		            '`Categories.CityCategory`.`year` = 2015'
		        ],
		        attributes: ['id', 'name', 'year']
		    }]
		})
	}

}

async function R18Single(query) {
	if (!(query.id * 1)) return null;
	
	return R18.findOne({
		where: {
			id: query.id
		},
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
	});
}

module.exports = {
	R18BulkCreate,
	R18Create,
	R18Paged,
	R18Single,
	SyncDB
}
