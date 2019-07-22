const util = {
	getDuration: (node) => {
		return util.trim(node.text() || '').replace(/^(\d+)(.*)$/, '$1');
	},
	getText(node) {
		return util.trim(node.text() || '');
	},
	trim(str) {
		return str.trimStart().trimEnd();
	},
	getTextWithId(node) {
		return {
			name: util.getText(node.find('a')) || util.getText(node),
			id: util.getIdFromUrl(node.attr('href') || node.find('a').attr('href') || '', 'id') || 0
		}
	},
	decodeUrl(url) {
		let kvs = url.toLowerCase().split('/'),
			urlParam = {};

		kvs.forEach( kv => {
			let [k, v] = kv.split('=');
			if (v) urlParam[k] = v;
		})
		return urlParam;
	},
	getIdFromUrl(url, k) {
		return util.decodeUrl(url)[k] || '';
	},
	getActress(node) {
		return {
			name: util.getText(node.find('span')),
			id: util.getIdFromUrl(node.find('a').attr('href') || '', 'id') || 0
		}
	}
}

module.exports = util;
