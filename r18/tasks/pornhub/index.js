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
				let writeStream = fs.createWriteStream(`./${fileName}`);
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
	console.log(`===============info got=${info.data}==========`)
	let rapidgator = extras.rapidgator.filter(link => {
		return link.split('/').pop().match(episode);
	})
	console.log(code, episode, rapidgator, '===========links got===========')
	for (let i = 0; i < rapidgator.length; i++) {
		await R.login();
		let oneTimeLink = await R.generateOneTimeLink(rapidgator[i]);
		console.log(`=========download ${rapidgator[i]} started=========`)
		await downloadOneTimeLink(oneTimeLink);
		console.log(`=========download ${rapidgator[i]} ended=========`)
	}
	let firstFileName = rapidgator[0].split('/').pop().replace('.html', '');
	if (firstFileName.match('.rar')) {
		execSync(`unrar x ${firstFileName}`)
		console.log(`=========unrar ${firstFileName} ended=========`)
	}
	return firstFileName;
}

//ffmpeg -i output.mp4 -ss 00:00:00.0 -t 3 -vf "scale=2048*1024,drawtext=text='More at Javlibrary.com':x=(w-text_w-50):y=(h-text_h-50):fontsize=70:fontcolor=white:shadowcolor=black:shadowx=5:shadowy=5" -c:v libx264  -c:a copy output1.mp4


//ffmpeg -i out.mp4 -vf "scale=2048*1024,drawtext=text='More at Javlibrary.com':x=(w-text_w-50):y=(h-text_h-50):fontsize=70:fontcolor=white:shadowcolor=black:shadowx=5:shadowy=5" -c:v libx264  -c:a copy output1.mp4

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