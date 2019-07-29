var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var env = process.env;
var basename = path.basename(__filename);
var db = {};

let sampleData = require('./testdata.js');

console.log(sampleData, '==============')

if (true || env.NODE_ENV === 'dev') {
		var sequelize = new Sequelize('r18', 'point', '1414914fdysg', {
				dialect: 'mysql',
				host: '202.182.117.178'
		});

} else {
		var sequelize = new Sequelize('r18', 'root', '1414914fdysg', {
				dialect: 'mysql',
				host: '127.0.0.1'
		});

}


fs
		.readdirSync(__dirname + '/model')
		.filter(file => {
				return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
		})
		.forEach(file => {
				var model = sequelize['import'](path.join(__dirname + '/model', file));
				db[model.name] = model;
		});


Object.keys(db).forEach(modelName => {
		if (db[modelName].associate) {
				db[modelName].associate(db);
		}
});


function saveOrUpdateEntry({
		firstTime = false,
		entry
}) {
		let { R18, Category} = db;

		if (firstTime) {
				//R18.create
		} else {
			let { code } = entry;
			db.R18.findOrCreate({
					where: {
							code
					},
					defaults: entry
			}).then(([r18, created])=> {
					console.log(r18, created, r18.setCategorys, r18.setCategory, '++++++++++++++++++==')
					r18.setCategorys(entry.category.map( cate => {
						return db.Category.create(cate)
					})).then((res) => {
							console.log(res, '=========category,============')
					})
			})
		}
		
}

async function test() {
		await sequelize.sync();

		db.sequelize = sequelize;
		db.Sequelize = Sequelize;

		saveOrUpdateEntry({
			firstTime: false,
			entry: sampleData
		})

}


test();

module.exports = db;
