const fs = require("fs");
const NodeCache = require('node-cache');
const nodeCache = new NodeCache({ 
	stdTTL: 60 * 180, 
	checkperiod: 120
});

let allMethods = {
	nodeCache
};

fs.readdirSync(__dirname).map(f => {
	console.log(__dirname, '===========')
	let methods = require(__dirname + '\\' +  f);
	
	Object.keys(methods).map(key => {
		if (allMethods[key]) throw new Error('duplicate method declaration: ' + key);
		if (key.match('get') && key !== "getRecentMessages") {
			allMethods[key] = async function() {

				let	data = nodeCache.get(key + JSON.stringify(arguments));
				if (!data) {
					data = await methods[key].apply(null, arguments);
					let raw = data.toJSON ? data.toJSON() : data;
					console.log(raw)
					if (typeof raw !== 'string') {
						raw = JSON.stringify(raw);
					}

					nodeCache.set(key + JSON.stringify(arguments), raw);
				} else {
					data = JSON.parse(data);
				}
				return data;
			}
		} else {
			allMethods[key] = methods[key];
		}
	});
});

module.exports = allMethods;
