const axios = require('axios');
const fs = require('fs');
const Rapidgator = require('../../tasks/syncRapidgator/rapidgatorTask/rapidgator.js');
const { execSync } = require('child_process');
const { 
	getR18Paged, 
	getR18Single,
	getR18PreNext
} = require('../../sequelize/methods/index.js');

module.exports = async (ctx, next) => {
    
    if (global.downloading) {
    	ctx.body = 'Downloading' + global.downloading;
    	return;
    }

    let { code, episode } = ctx.query;
    if (code && episode) {
    	ctx.body = 'Starting downloading';
    	downloadFromRapidgator(code, episode);
    	return;
    }
    
}

function downloadOneTimeLink(url) {
	return new Promise((resolve, reject) => {
		try {
			axios({
				method: 'GET',
				url,
				responseType: 'stream'
			}).then(res => {
				let stream = res.data,
					headers = res.headers;

				let fileName = headers['content-disposition'].replace(/^(.*)\"(.+)\"(.*)$/, "$2");
				let writeStream = fs.createWriteStream(`./static/${fileName}`);
				stream.pipe(writeStream);
				stream.on('end', resolve)
			})
		} catch(e) {
			reject(e.message)
		}
	})
}

async function downloadFromRapidgator(code, episode) {
	global.downloading = code;
	// try {
		try {
			execSync('rm *.mp4', {
				cwd: '../static'
			})
		} catch(e) {

		}
		
		let info = await getR18Single({
				code
			}),
			extras = JSON.parse(info.Extras.extra),
			R = new Rapidgator();

		let rapidgator = extras.rapidgator.filter(link => {
			return link.split('/').pop().match(episode);
		})
		console.log(rapidgator, '========')
		for (let i = 0; i < rapidgator.length; i++) {
			await R.login();
			let oneTimeLink = await R.generateOneTimeLink(rapidgator[i]);
			console.log(oneTimeLink, '-=========oneTimeLink =======generateOneTimeLink')
			await downloadOneTimeLink(oneTimeLink);
		}
		let firstFileName = rapidgator[0].split('/').pop().replace('.html', '');
		if (firstFileName.match('.rar')) {
			execSync(`unrar x ${firstFileName}`)
		}
		return firstFileName;
	// } catch(e) {

	// }
	global.downloading = '';
	
}

//	xYY990v0