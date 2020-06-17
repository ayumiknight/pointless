const db = require('../index.js');
const { R18, Series, Studio, Actress, Category, Gallery, sequelize, Extra } = db;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

//never use bulkcreate, mysql won't return primary ids for bulk insert!!!
const mySelected = [
	"KMVR-831",
	"KMVR-827",
	"JPSVR-006",
	"KMVR-800",
	"URVRSP-042",
	"KMVR-816"
];
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
	return created;
}


async function getR18Paged(query) {
	let { 
		actress_id, 
		category_id, 
		series_id, 
		studio_id, 
		page = 1,
		pagesize,
		lcode,
		rapidgator,
		torrent,
		javlibrary,
		nonVR,
		both
	} = query;

	let r18Query = {
		offset: (page - 1) * pagesize,
		limit: pagesize
	}

	if (javlibrary) {
		r18Query.where = {
			javlibrary: {
				[Op.eq]: null
			}
		}
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
	
		r18Query.order = [[Sequelize.literal('`Extras.createdAt`'), 'DESC']];
		r18Query.include = r18Query.include || [];
		r18Query.include.push({
			association:  R18.Extras,
			where: {
				id: {
					[Op.ne]: null
				}
			}
		});
	

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
	
	if (torrent) {
		r18Query.where = {
			torrent: {
				[Op.eq]: 1
			}
		}
	}

	if (!r18Query.where) {
		r18Query.where = {};
	}
	!both && (r18Query.where.vr = nonVR ? {
		[Op.eq]: 0
	} : {
 		[Op.eq]: 1
	});

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
			code: {
				[Op.eq]: code.toUpperCase()
			}
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
		}, {
			association: R18.Galleries,
			as: 'Galleries'
		}, {
			model: Extra,
			as: 'Extras'
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

async function getR18WithExtraPaged({
	page = 1,
	pagesize = 20,
	code,
	vr = 1
}) {

	let query = {
		offset: (page - 1) * pagesize,
		limit: pagesize,
		order: [[
			'order', 'ASC'
		]],
		include: [{
			model: Extra,
			as: 'Extras'
		}],
		where: {
			vr: {
				[Op.eq]: vr
			}
		}
	};
	if (code) {
		query.where.code = {
			[Op.like]: `${code}`
		}
	}
	return R18.findAll(query);
}

async function getR18PreNext({
	lcode,
	isNext,
	offset = 0,
	limit = 1,
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
		limit
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

function tagR18sWithTorrent(code) {
	return sequelize.query(`UPDATE R18s SET torrent = 1 WHERE \`code\` = '${code}'`)
}

async function updateR18Javlibrary(code) {
	let r18 = await R18.findOne({
		where: {
			code
		}
	});
	await r18.update({
		javlibrary: 1
	});

}

async function getNewRapidgator() {
	let today = new Date();
	today.setHours(0);
	today.setMinutes(0);
	today.setSeconds(0);
	today = today.toJSON();

	let query = {
		order: [[
			'id', 'ASC'
		]],
		include: [{
			model: Extra,
			as: 'Extras',
			where: {
				createdAt: {
					[Op.gt]: today
				}
			}
		}]
	};
	let res = await R18.findAll(query);
	if (res && res.length) {
		let vr = 0,
			nonvr = 0;

		res.forEach((v) => {
			if (v.vr) {
				vr++;
			} else {
				nonvr++;
			}
		})
		console.log({
			vr,
			nonvr
		})
		return {
			vr,
			nonvr
		}
	}
	return {

	}
}

module.exports = {
	R18BulkCreate,
	R18Create,
	getR18Paged,
	getR18PagedNoCache: getR18Paged,
	getR18WithExtraPaged,
	getR18Single,
	getR18SingleSimple,
	getR18PreNext,
	SyncDB,
	sequelize,
	measureR18s,
	getMySelected,
	tagR18sWithTorrent,
	updateR18Javlibrary,
	getNewRapidgator
}
