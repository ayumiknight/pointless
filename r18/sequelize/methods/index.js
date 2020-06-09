const fs = require("fs");
const NodeCache = require('node-cache');
const nodeCache = new NodeCache({ 
	stdTTL: 60 * 60, 
	checkperiod: 60
}); //1 hour
const fastCache = new NodeCache({
	stdTTL: 60,
	checkperiod: 60,
}); // 1 minute
let allMethods = {
	nodeCache,
	fastCache
};

fs.readdirSync(__dirname).map(f => {

	let methods = require(__dirname + '/' +  f);
	
	Object.keys(methods).map(key => {
		if (allMethods[key]) throw new Error('duplicate method declaration: ' + key);
		if (key.match('get') && key !== "getRecentMessages") {

			let cacheObj = key in ["getCurrentClicks", "getR18PagedNoCache"] ? fastCache : nodeCache;

			allMethods[key] = async function() {
				let	data = cacheObj.get(key + JSON.stringify(arguments));
				if (!data) {
					data = await methods[key].apply(null, arguments);
					let raw = data && data.toJSON ? data.toJSON() : data;
					
					if (typeof raw !== 'string') {
						raw = JSON.stringify(raw);
					}
					cacheObj.set(key + JSON.stringify(arguments), raw);
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
