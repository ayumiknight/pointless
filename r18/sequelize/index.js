var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var env = process.env;
var basename = path.basename(__filename);
var db = {};

let sampleData = require('./testdata.js');



if (env.NODE_ENV === 'dev') {
    var sequelize = new Sequelize('r18', 'point', '1414914fdysg', {
        dialect: 'mysql',
        host: '202.182.117.178',
        define: {
            charset: 'utf8',
            collate: 'utf8_general_ci', 
            timestamps: true
        }
    });

} else {
    var sequelize = new Sequelize('r18', 'root', '1414914fdysg', {
        dialect: 'mysql',
        host: '127.0.0.1',
        define: {
            charset: 'utf8',
            collate: 'utf8_general_ci', 
            timestamps: true
        }
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

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
