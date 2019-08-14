module.exports = function(models) {
	for(let model in models) {
		for(let property in models[model]) {
			let value = models[model][property];
			if ( property[0] !== '_' && typeof value === 'function' && !models[model]['_' + property]) {
				models[model]['_' + property] = function(args) {
					return new Promise(resolve, reject) {
						models[model][property](args)
					}
				}
			}
		}
	}


}


// SET FOREIGN_KEY_CHECKS = 0;
// drop table if exists Actresses;
// drop table if exists Categories;
// drop table if exists Galleries;
// drop table if exists R18Actresses;
// drop table if exists R18Categories;
// drop table if exists R18s;
// drop table if exists Series;
// drop table if exists Studios;
// SET FOREIGN_KEY_CHECKS = 1;

SET FOREIGN_KEY_CHECKS = 0;

drop table if exists Galleries;
drop table if exists R18Actresses;
drop table if exists R18Categories;
drop table if exists R18s;

SET FOREIGN_KEY_CHECKS = 1;


SELECT * FROM Categories WHERE category_id = 1018;
SELECT * FROM Galleries;
SELECT * FROM R18Categories;
SELECT * FROM R18s;
