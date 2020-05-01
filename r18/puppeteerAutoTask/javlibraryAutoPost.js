

const puppeteer = require('puppeteer');
const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36";
const fs = require('fs');
const url = require('url');
const axios = require('axios');
const javlibraryConf = require('./javlibraryConf.js');
const md5 = require('md5');
const { 
	getR18Paged,
	updateR18Javlibrary 
} = require('../sequelize/methods/r18.js');
const crawl = require('../tasks/index.js');

injectLogger();

//https://www.jvrlibrary.com/jvr?id=${_code}&raw=1

let postPageFromArgv = process.argv.find(one => one.match(/^--postPage\d$/))
let postPage = postPageFromArgv ? postPageFromArgv.replace(/^.*(\d+)$/i, '$1') : 100;

function injectLogger() {
	var log_file = fs.createWriteStream(__dirname + `/${+new Date()}debug.log`, {flags : 'w'});

	var fn = process.stdout.write;
	function write() {
	  fn.apply(process.stdout, arguments);
	  log_file.write.apply(log_file, arguments);
	}
	process.stdout.write = write;
}

class JavlibraryAutoPost {
	constructor(browser) {
		this.browser = browser;
		this.captchaMap = {};
		this.init();
		// setTimeout(async () => {
		// 	console.log('exited after 30min')
		// 	await this.browser.close();
		// 	process.exit(0);
		// }, 30 * 60 * 1000);
		
	}

	async init() {
		let self = this;
		await this.wait(10); //each start should have interval
		fs.readdirSync('./captcha').map(f => {
			let [name, ext] = f.split('.'),
				[hash, value] = name.split('-');

			self.captchaMap[hash] = value || 'null';
		});	
		await this.beginTask();
	}

	checkOrSaveCaptcha(captchaBase64) {
		let captcha = captchaBase64.replace(/^(.+base64,)(.+)$/, "$2");
		captcha = Buffer.from(captcha,'base64');
		let hash = md5(captcha);
		if (this.captchaMap[hash] && this.captchaMap[hash] !== 'null') {
			return this.captchaMap[hash];
		} else {
			fs.writeFileSync(`./captcha/${hash}.jfif`, captcha);
			return null;
		}
		
	}
	async syncCaptcha() {
		//http://www.javlibrary.com/en/myaccount.php

	
		await this.page.goto('http://www.javlibrary.com/en/login.php', {timeout : 0});
	  	await this.page.waitForSelector('#confirmobj', { visible: true, timeout: 0 });

		let res = await this.page.evaluate(async function() {

			let confirmObj = await new Promise((resolve, rej) => {
				let myInter = setInterval(function() {
					console.log('getting')
					src = document.getElementById('confirmobj').src;
					if (src.match('img_confirmobj')) {
						clearInterval(myInter)
						resolve(src);
					}
				}, 1000);
			})
			return confirmObj;
		});
		
		let captcha;
		while(true) {
			captcha = await this.page.evaluate(async function() {
				console.log('getting captcha')
				let content = await new Promise((resolve) => {
					var xhr = new XMLHttpRequest();
					xhr.onreadystatechange = function() {
						if (this.readyState == 4 && this.status == 200) {
						    let reader = new FileReader();
						    reader.onload = function (e) { resolve(e.target.result); }
						    reader.readAsDataURL(this.response);
						}
					}
					xhr.open('GET',  document.getElementById('confirmobj').src);
					xhr.responseType = 'blob';
					xhr.send();   
				});
				return content;
			})
			if (captcha) {
				captcha = captcha.replace(/^(.+base64,)(.+)$/, "$2");
				captcha = Buffer.from(captcha,'base64');
				let hash = md5(captcha);
				console.log(captcha)
				fs.writeFileSync(`./captcha/${hash}.jfif`, captcha);
			}
			await new Promise((res, rej) => {
				setTimeout(res, 2000)
			})
		}
	}

	async getAndDownloadConfirmObj() {
		let res = await this.page.evaluate(async function() {
			let confirmObj = await new Promise((resolve, rej) => {
				let myInter = setInterval(function() {
					console.log('getting')
					src = document.getElementById('confirmobj').src;
					if (src.match('img_confirmobj')) {
						clearInterval(myInter)
						resolve(src);
					}
				}, 1000);
			})
			return confirmObj;
		});

		console.log(res, '======= confirmObj detected ===========')
		let	captcha = await this.page.evaluate(async function() {
			let content = await new Promise((resolve) => {
				var xhr = new XMLHttpRequest();
				xhr.onreadystatechange = function() {
					if (this.readyState == 4 && this.status == 200) {
					    let reader = new FileReader();
					    reader.onload = function (e) { resolve(e.target.result); }
					    reader.readAsDataURL(this.response);
					}
				}
				xhr.open('GET',  document.getElementById('confirmobj').src);
				xhr.responseType = 'blob';
				xhr.send();   
			});
			return content;
		});
		console.log('======= raw captcha got ===========')
		return captcha;
	}

	async login() {
		//http://www.javlibrary.com/en/myaccount.php
		await this.page.goto('http://www.javlibrary.com/en/login.php', {timeout : 0});
	  	await this.page.waitForSelector('#confirmobj', { visible: true, timeout: 0 });
	  	let captcha = await this.getAndDownloadConfirmObj();
	  	
		let captchaSolution = this.checkOrSaveCaptcha(captcha);
		console.log(captchaSolution, '==========captchaSolution for login')
		if (!captchaSolution) throw new Error('captcha no match================');

		let loginRes = await this.page.evaluate(function(input) {
			console.log(input, '=============login info ===================')
			document.getElementById('adultwarningmask').style.display='none';
			setCookie('over18', 18);
			document.getElementById('userid').value = input.username;
			document.getElementById('password').value = input.password;
			document.getElementById('verification').value = input.captcha;
			document.getElementById('btn_login').click();
		}, {
			username: javlibraryConf.username,
			password: javlibraryConf.password,
			captcha: captchaSolution
		});
		console.log('=============login completing wait 5 secs ===================')
		await this.wait(5);
	}

	async beginTask() {
		console.log('begin task=====================')
		let R18s = await getR18Paged({
			raw: 1,
			pagesize: postPage,
			rapidgator: true,
			page: 1
		});

		let rows = R18s.rows.filter( row => !row.javlibrary);
		if (!rows.length) {
			console.log('all entries posted==============');
			await this.browser.close();
			process.exit(0);
		} else {
			this.page = await this.browser.newPage();
			this.page.setDefaultNavigationTimeout(5 * 60 * 1000);
			await this.page.setUserAgent(userAgent);	
			await this.login();
			for(let i = 0; i < rows.length; i++) {
				await this.checkAndPostSingle(rows[i]);
			}
			await this.browser.close();
			process.exit(0);
		}
		
	}


	async checkAndPostSingle(row) {
		await this.wait(5);

		let code = row.code,
			error = false;	

		if (row.javlibrary == 1) {
			console.log(`already posted ${code}================\n`);
			return
		}

		console.log(`processing ${code}================\n`)
		try {
			try {
				await this.page.goto(`http://www.javlibrary.com/en/vl_searchbyid.php?keyword=${code.replace('3DSVR', 'DSVR').replace('-', '+')}`, {
					timeout: 60000
				});
			} catch(e) {
				let notFound = await this.page.evaluate(function() {
					return !!document.getElementById('rightcolumn').innerHTML.match('Search returned no result.')
				});
				if (!notFound) {
					await this.page.screenshot({
					    path: new Date() + code + '.png',
					    fullPage: true
					});
					throw new Error('time out page not loaded')
				}
			}		
			await this.page.waitForSelector('#video_comments', { visible: true, timeout: 3000 });
			
 
		} catch(e) {
			console.log(`${code} code not found ==================\n, ${e.message}`)
			error = true;
		}

		if (error) return;
			
		console.log('comments block appeared==========\n')
		let commented = await this.page.evaluate(function() {
			return !!document.getElementById('video_comments').innerHTML.match('ayumiknight');
		});
		console.log(`commented ${commented} ==========\n`)
		if (commented) {
			await updateR18Javlibrary(code);
			return;
		}


		let extras = row.Extras;
		let rapidgator = JSON.parse(extras.extra).rapidgator;

		let formatEntry = this.formatEntry(rapidgator);
		let openCommentAndFillEntry = await this.page.evaluate(function(formatEntry) {
			document.getElementById('video_icn_comment_edit').getElementsByTagName('input')[0].click();
			setTimeout(function() {
				document.getElementById('video_comment_edit_text').value = formatEntry;

			})
		}, formatEntry);

		let captcha = await this.getAndDownloadConfirmObj();
		let captchaSolution = this.checkOrSaveCaptcha(captcha);
		console.log('captchaSolution ==========', captchaSolution)
		if (captchaSolution) {
			let postResult = await this.page.evaluate(function(captchaSolution) {
				document.getElementById('verification').value = captchaSolution;
				document.getElementById('video_comment_edit').querySelector('.green.button').click();
				setTimeout(() => {
					document.getElementsByClassName('noty_buttons')[0].getElementsByClassName('green')[0].click();
				},20)
			}, captchaSolution);
			console.log(`${code} successfully posted ==================`)
			await updateR18Javlibrary(code);
			await this.wait(25); //each post should have 30s cool down;
		}
	}

	formatEntry(rapidgator) {
		let rapidgatorFormatted = rapidgator.map(link => {
			return `[url=${link}]${link}[/url]\n`;
		}).join('');

		return `[url=https://jvrlibrary.com/rapidgator][img]https://jvrlibrary.com/static/jvrslogan-sm.jpg[/img][/url]\n\n\n[url=https://jvrlibrary.com/rapidgator][b]Visit jvrlibrary.com for More Japan VR videos !! Have FUUUNNNN !![/b][/url]\n\n\n` + rapidgatorFormatted + `\n[url=https://jvrlibrary.com/rapidgator][img]https://jvrlibrary.com/static/coffin_dance.jpg[/img][/url]`;
	}

	wait(sec) {
		return new Promise(res => {
			setTimeout(res, sec * 1000)
		});
	}

}

// module.exports = JavlibraryAutoPost;
async function test() {
	// let browser = await puppeteer.launch({
	// 	headless: false,
	// 	args: [
	//       '--proxy-server=http://127.0.0.1:1080',
	//     ],
	// });
	let browser,
		allR18s = !!process.argv.find(one => one.match('--allR18s'));

	!allR18s && setTimeout(async () => {
		if (browser) {
			await browser.close();
			console.log('about to end process after 1 hours');
			process.exit(0);
		}
	}, 1000 * 60 * 60);

	await crawl(allR18s);

	browser = await puppeteer.launch({
		headless: true,
		args: [
			'--no-sandbox',
			'--disable-gpu',
			'--single-process'
		]
	});
	let Javlibrary = new JavlibraryAutoPost(browser);


	
}

test();