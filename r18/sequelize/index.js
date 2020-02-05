var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var env = process.env;
var basename = path.basename(__filename);
var { dbName, dbUser, dbPassword, dbAddress} = require('dbConfig.js');
var db = {};

let sampleData = require('./testdata.js');


var sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    dialect: 'mysql',
    host: dbAddress,
    define: {
        charset: 'utf8',
        collate: 'utf8_general_ci', 
        timestamps: true
    }
});

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
