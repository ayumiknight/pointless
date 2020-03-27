const axios = require('axios');
const fs = require('fs');
const Rapidgator = require('../syncRapidgator/rapidgatorTask/rapidgator.js');
const { execSync } = require('child_process');

var log_file = fs.createWriteStream(__dirname + `/${+new Date()}debug.log`, {flags : 'w'});

var fn = process.stdout.write;
function write() {
  fn.apply(process.stdout, arguments);
  log_file.write.apply(log_file, arguments);
}
process.stdout.write = write;


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
				let writeStream = fs.createWriteStream(`../../koa/static/${fileName}`);
				stream.pipe(writeStream);
				stream.on('end', resolve)
			})
		} catch(e) {
			reject(e.message)
		}
	})
}

async function downloadFromRapidgator(code, episode) {
	let info = await axios.get(`https://www.jvrlibrary.com/jvr?id=${code}&raw=1`);
		extras = JSON.parse(info.data.Extras.extra),
		R = new Rapidgator();

	let rapidgator = extras.rapidgator.filter(link => {
		return link.split('/').pop().match(episode);
	})

	for (let i = 0; i < rapidgator.length; i++) {
		await R.login();
		let oneTimeLink = await R.generateOneTimeLink(rapidgator[i]);
		await downloadOneTimeLink(oneTimeLink);
	}
	let firstFileName = rapidgator[0].split('/').pop().replace('.html', '');
	if (firstFileName.match('.rar')) {
		execSync(`unrar x ${firstFileName}`)
	}
	return firstFileName;
}

//ffmpeg  -i out1.mp4 -vf "scale=2048*1024,drawtext=text='More at Jvrlibrary.com':x=(w-text_w-30):y=(h-text_h-30):fontsize=30:fontcolor=white:shadowcolor=black:shadowx=2:shadowy=2" -c:v h264_nvenc  -c:a copy output1.mp4

//ffmpeg -i ${fileName} -ss ${start} -c copy -t ${duration} out.mp4
async function index() {
	let args = process.argv;
	args = args.filter( arg => {
		return arg.match('--')
	}).map(arg => {
		return arg.replace('--', '')
	})
	let fileName = await downloadFromRapidgator.apply(null, args);
}

index();