const db = require('../index.js');
const { R18, Series, Studio, Actress, Category, Gallery, sequelize } = db;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
//never use bulkcreate, mysql won't return primary ids for bulk insert!!!
const mySelected = [
	"KMVR-668",
	"TMAVR-072",
	"KMVR-618",
	"MDVR-054",
	"TMAVR-043",
	"EXVR-141",
	"TMAVR-055",
	"DOVR-021",
	"EXBVR-010",
	"BIKMVR-108"

]
async function SyncDB() {
	await db.sequelize.sync();
}

async function R18BulkCreate({
	entries
}) {
	//Promise.all approach can save r18s ,but following assciations are not saved because of timeout
	//await Promise.all(entries.map( entry => R18Create({ entry })));
	
	let i = 0;
	while(entries[i]) {
		await R18Create({ entry: entries[i] });
		i++;
	}
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


async function getR18Paged(query) {
	let { 
		actress_id, 
		category_id, 
		series_id, 
		studio_id, 
		page,
		pagesize,
		lcode
	} = query;


	let r18Query = {
		offset: (page - 1) * pagesize,
		limit: pagesize,
		order: [[
			'order', 'ASC'
		]]
	}

	if (lcode) {
		r18Query.where = {
			code: {
				[Op.like]: `${lcode}%`
			}
		}
		r18Query.order = [[
			'coden', 'DESC'
		]]
	}
	if (actress_id) {
		r18Query.include = [{
			association:  R18.Actresses,
			as: 'Actresses',
			where: {
				actress_id
			}
		}]
	}
	if (category_id) {
		r18Query.include = [{
			association:  R18.Categories,
			where: {
				category_id
			}
		}];
	}
	if (studio_id) {
		r18Query.include = [{
			association:  R18.Studio,
			where: {
				studio_id
			}
		}];
	}
	if (series_id) {
		r18Query.include = [{
			association:  R18.Series,
			where: {
				series_id
			}
		}];
	}
	return R18.findAndCountAll(r18Query);
}

async function getR18Single({
	id,
	code
}) {
	if (!id && !code) return null;
	
	let where = id ? {
			id
		} : {
			code
		};

	return R18.findOne({
		where,
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

async function getR18SingleSimple({
	id,
	code
}) {
	if (!id && !code) return null;
	
	let where = id ? {
			id
		} : {
			code
		};

	return R18.findOne({
		where
	});
}

async function getR18PreNext({
	lcode,
	isNext,
	offset = 0,
	limit = 10,
	coden
}) {

	let query = {
		where: {
			code: {
				[Op.like]: `${lcode}%`
			}
		},
		order: [[
			'coden', isNext ? 'DESC' : 'ASC'
		]],
		offset,
		limit,
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
	};
	if (isNext) {
		query.where.coden = {
			[Op.lt]: coden
		};
	} else {
		query.where.coden = {
			[Op.gt]: coden
		};
	}
	return R18.findAll(query);
}

async function getMySelected() {
	return Promise.all(mySelected.map(code => {
		return getR18SingleSimple({ code });
	}));
}

async function measureR18s() {
	return sequelize.query("SELECT COUNT(DISTINCT(`code`)) FROM `R18s`;")
}


module.exports = {
	R18BulkCreate,
	R18Create,
	getR18Paged,
	getR18Single,
	getR18SingleSimple,
	getR18PreNext,
	SyncDB,
	sequelize,
	measureR18s,
	getMySelected
}
