var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var env 	  = process.env;
var basename  = path.basename(__filename);
var db        = {};

var dbconfig = require('../.dbconfig');
console.log(dbconfig, JSON.stringify(dbconfig),' this is db config============')

var sequelize = new Sequelize(dbconfig.db, dbconfig.user, dbconfig.password, {
    dialect: 'mysql',
    host: dbconfig.host
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

sequelize.sync().then( console.log('==================database ready==============='))
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
