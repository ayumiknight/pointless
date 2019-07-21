var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var env 	  = process.env;
var basename  = path.basename(__filename);
var db        = {};

var ckey = fs.readFileSync('./cert/client-key.pem');
var ccert = fs.readFileSync('./cert/client-cert.pem');
var sca = fs.readFileSync('./cert/server-ca.pem');

if (env.NODE_ENV === 'dev') {
    var sequelize = new Sequelize('pointful', 'fudaiyue', '1414914fdysg', {
        dialect: 'mysql',
        dialectOptions: {
            ssl: {
                key: ckey,
                cert: ccert,
                ca: sca
            }
        },
        host: '35.229.60.84'
    });

} else {
    var sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
        dialect: 'mysql',
        dialectOptions: {
            ssl: {
                key: cKey,
                cert: ccert,
                ca: sca
            }
        },
        host: env.CLOUD_SQL_CONNECTION_NAME
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

sequelize.sync().then( console.log('==================database ready==============='))
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
