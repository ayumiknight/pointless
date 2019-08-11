const root = require('./root.js');
const axios = require('axios');
const fs = require('fs');
//simple crawler for google.com
//confirmed with root.js and root-from-browser-dom
//352 galleries are currently available

// sample url https://www.google.com/streetview/feed/gallery/collection/uruguay-highlights.json

async function loadAndSaveGallery(galleryName, parent) {
	let res = await axios.get(`https://www.google.com/streetview/feed/gallery/collection/${galleryName}.json`);
	res = res.data;
	res.parent = parent;
	await fs.writeFileSync(`./data/${galleryName}.json`, JSON.stringify(res));
}

async function index() {
	for(let key in root) {
		console.log('loading======>', key)
		let data = await loadAndSaveGallery(key, root[key]);
	}
}

index();
