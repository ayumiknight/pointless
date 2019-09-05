const util = {
	getDuration: (node) => {
		return util.trim(node.text() || '').replace(/^(\d+)(.*)$/, '$1');
	},
	getText(node) {
		let text = util.trim(node.text() || '');
		return text === "----" ? "" : text;
	},
	getCode(i) {
		return i.replace(/^([a-zA-Z_]*)(\d*)([a-zA-Z]+)(\d+)$/, "$3-$4").toUpperCase();
	},
	trim(str) {
		return str.trimStart().trimEnd();
	},
	getTextWithId({
		node,
		textName,
		idName
	}) {
		let obj = {};
		obj[textName] = util.getText(node.find('a')) || util.getText(node);
		obj[idName] = util.getIdFromUrl(node.attr('href') || node.find('a').attr('href') || '', 'id') || 0;

		return obj[idName] * 1 ? obj : null; 
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
	getActress({
		node,
		textName
	}) {
		let obj = {};
		obj[textName] = util.getText(node.find('span'));
		obj['actress_id'] = util.getIdFromUrl(node.find('a').attr('href') || '', 'id') || 0
		return obj['actress_id'] * 1 ? obj : null;
	},
	getTitle(node) {
		let text = node.text() || node.find('cite').text();
		return text.trimStart().trimEnd();
	},
	safeMerge(a, b) {
		let keys = Object.keys({
			...a,
			...b
		});
		let merged = {};
		keys.forEach(key => {
			merged[key] = a[key] || b[key];
		})
		return merged;
	}
}

module.exports = util;
