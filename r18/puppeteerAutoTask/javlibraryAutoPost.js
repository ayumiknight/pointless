

const puppeteer = require('puppeteer');
const devices = require('puppeteer/lib/DeviceDescriptors')
// const userAgent = getAgents();
const fs = require('fs');
const url = require('url');
const axios = require('axios');
const javlibraryConf = require('./javlibraryConf.js');
const md5 = require('md5');
const { 
	getR18Paged,
	updateR18Javlibrary,
	updateR18LastPost
} = require('../sequelize/methods/r18.js');
const crawl = require('../tasks/index.js');
const javlibraryDomain = [
	'http://www.javlibrary.com',
//	'http://www.m45e.com', redirect to http://www.f50q.com/
	// 'http://www.b47w.com', redirect to http://www.f50q.com/
	// 'http://a48u.com', // no cloudflare
	'http://b49t.com', // no cloudflare
	'http://k51r.com' // no cloudflare
	// 'http://f50q.com' // no cloudflare
	// 'http://j41g.com' redirects to b47w.com
]
const deviceToEmulate = devices[Math.floor((Math.random() - 0.001 * devices.length))];


let postPageFromArgv = process.argv.find(one => one.match(/^--postPage(\d+)$/))
let postPage = postPageFromArgv ? postPageFromArgv.replace(/^--postPage(\d+)$/i, '$1') : 400;
postPage *= 1;

class JavlibraryAutoPost {
	constructor({
		headful = false,
		firefox = false
	}) {
		this.browser = null;
		this.captchaMap = {};
		this.headful = process.argv.find(one => one.match(/^--headful$/)) || headful;
		this.firefox = process.argv.find(one => one.match(/^--firefox$/)) || firefox;
		this.domainToUse = javlibraryDomain[Math.floor((Math.random() - 0.001) * javlibraryDomain.length)];
	}

	async init() {
		console.log('=========domainToUse===========', this.domainToUse)
		let self = this;
		await this.wait(10); //each start should have interval

		const options =  this.headful ? {
			headless: false,
			args: [
				'--no-sandbox'
			]
		} : {
			headless: true,
			args: [
				'--no-sandbox',
				'--disable-gpu',
				'--single-process'
			]
		}
		if (this.firefox) {
			options.product = 'firefox'
			options.executablePath = '/usr/firefox/firefox' 
			// options.dumpio = true
		} else {
			// options.executablePath = '/usr/chrome-linux/chrome'
		}

		try {
			console.log('starting options', options)
			this.browser = await puppeteer.launch(options);
			let pages = await this.browser.pages();
			this.page = pages[0];
			this.page.setDefaultNavigationTimeout(5 * 60 * 1000);
			// await this.page.emulate(deviceToEmulate);
			await this.page.setViewport({
				width: 1024,
				height: 768,
				deviceScaleFactor: 1
			});

			fs.readdirSync(__dirname + '/captcha').map(f => {
				let [name, ext] = f.split('.'),
					[hash, value] = name.split('-');

				self.captchaMap[hash] = value || 'null';
			});
			await this.login();
			await this.beginTask();
		} catch(e) {
			try {
				await this.browser.close();
			} catch(e) {}
		}
	}

	checkOrSaveCaptcha(captchaBase64) {
		let captcha = captchaBase64.replace(/^(.+base64,)(.+)$/, "$2");
		captcha = Buffer.from(captcha,'base64');
		let hash = md5(captcha);
		if (this.captchaMap[hash] && this.captchaMap[hash] !== 'null') {
			return this.captchaMap[hash];
		} else {
			fs.writeFileSync(__dirname + `/captcha/${hash}.jfif`, captcha);
			return null;
		}
		
	}
	async syncCaptcha() {
		//http://www.javlibrary.com/en/myaccount.php

		await this.page.goto(this.domainToUse + '/en/login.php', {timeout : 10000});
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
				fs.writeFileSync(__dirname + `/captcha/${hash}.jfif`, captcha);
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
				setTimeout(resolve, 5000)
			});
			return content;
		});
		console.log('======= raw captcha got ===========', captcha)
		return captcha;
	}

	async login() {
		//http://www.javlibrary.com/en/myaccount.php
		try {
			await this.page.goto(this.domainToUse + '/en/login.php', {timeout : 300 * 1000 });
			await this.page.waitForSelector('#confirmobj', { visible: true, timeout: 60 * 10 * 1000 });
		} catch(e) {
			await this.page.screenshot({
			    path: '/koa/static/' + (new Date() + 1) + '.png',
			    fullPage: true
			});
			throw new Error('login has some issue')
		}
		console.log('before extracting confirm obj======')
		
		let captcha = await this.getAndDownloadConfirmObj();
		
		if (!captcha) throw new Error('can not get captcha==================');
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

		let pagesize = 1,
			count = 0,
			pagenum = 1,
			errored = false

		while(count <= postPage) {
			let R18s = await getR18Paged({
				pagesize: pagesize,
				page: pagenum,
				javlibrary: true,
				both: true
			});
			const rows = R18s.rows || [];

			let extras = JSON.parse(rows[0].Extras.extra);
			let source = JSON.parse(rows[0].Extras.source || '{}');
			let rapidgator = extras.rapidgator || [];
			
			let valid = true
			if (rows[0].vr) {
				if (!extras.k2s || !extras.k2s.length) {
					valid = false
				} else if (extras.k2s.length < (source.tez || []).length) {
					valid = false
				}
			} else {
				if (!rapidgator.length) {
					valid = false
				}
			}

			if (!rows.length) {
				console.log(pagenum + ' all entries posted============\n')
				break;
			} else if (!valid){
				console.log(rows[0].code, '==========no data to post===========')
				pagenum += 1
				// noop
			} else {
				const lastPost = rows[0].lastPost
				
				if (true) {
					const success = await this.checkAndPostSingle(rows[0]);
					!success && (pagenum += 1);
					(typeof success === 'boolean' && !success) && (errored = true);
					await updateR18LastPost(rows[0].id)
					
				}	else {
					pagenum += 1
					console.log(`${rows[0].code} last posted at ${lastPost}`)
				}
			}
			if (errored) {
				break;
			}
			count++;
		}	

		await this.browser.close();
		return;	
	}


	async checkAndPostSingle(row) {
		// await this.wait(5);

		let code = row.code,
			error = false;	

		if (row.javlibrary == 1) {
			console.log(`already posted ${code}================\n`);
			return
		}

		console.log(`processing ${code}================\n`)
		try {
			try {
				await this.page.goto( this.domainToUse + `/en/vl_searchbyid.php?keyword=${code.replace('3DSVR', 'DSVR').replace('-', '+')}`, {
					timeout: 30000
				});
			} catch(e) {
				// const oldPage = this.page;
				// this.page = await this.browser.newPage()
				// this.page.setDefaultNavigationTimeout(5 * 60 * 1000);
				// // await this.page.emulate(deviceToEmulate);
				// await this.page.setViewport({
				// 	width: 1024,
				// 	height: 768,
				// 	deviceScaleFactor: 1
				// });
				// await this.login();
				// oldPage.close()
				// await this.wait(10)
				// return
				return false
			}
			let searchResult = await this.page.evaluate(function(code) {
				try {

					let hasCommment = document.getElementById('video_comments');
					if (hasCommment) {
						return {
							hasCommment: true
						}
					}
					
					let notFound = !!document.getElementById('rightcolumn').innerHTML.match('Search returned no result.');
					if (notFound) {
						return {
							error: 'search no result======'
						}
					}
					
					let alinks = document.querySelectorAll('.video>a');

					let j = 0,
						link;
					if (alinks.length) {
						while(j < alinks.length) {
							let id = alinks[j].querySelector('div').innerText || '';
							if (id.toUpperCase() === code.replace('3DSVR', 'DSVR').toUpperCase()) {
								link = alinks[j].href;
								break;
							}
							j++;
						}
					}
					if (link) {
						return {
							link
						}
					} else {
						return {
							error: 'something wrong with search result page'
						}
					}
				} catch(e) {
					return {
						error: e.message
					}
				}
			}, code);



			if (searchResult.link) {
				await this.page.goto(searchResult.link, {
					timeout: 60000
				})
			} else if (searchResult.error) {
				throw new Error(searchResult.error)
			}
 
		} catch(e) {
			let date = new Date() * 1;
			console.log(`${date} ${code} code not found ==================\n`, e.message)
			// await this.page.screenshot({
			//     path: '../koa/static/' + date + code + '.png',
			//     fullPage: true
			// });
			error = true;
		}
		
		if (error) {
			// await this.wait(5);
			return;
		}
			
		console.log('comments block appeared==========\n')
		let commented = await this.page.evaluate(function() {
			return !!document.getElementById('video_comments').innerHTML.match('ayumiknight');
		});
		console.log(`commented ${commented} ==========\n`)
		if (commented) {
			await updateR18Javlibrary(code);
			return;
		}


		let extras = JSON.parse(row.Extras.extra);


		let formatEntry = this.formatEntry(extras, code);
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
			await this.wait(30); //each post should have 30s cool down;
			return true
		}
		
	}

	formatEntry(extras, code) {
		const {
			rapidgator = [],
			k2s = []
		} = extras;
		let rapidgatorFormatted = rapidgator.map(link => {
			return `[url=${link}]${link}[/url]\n`;
		}).join('');
		let k2sFormatted = k2s.map(link => {
			return `[url=${link}]${link}[/url]\n`;
		}).join('');
		let urls = [k2sFormatted, rapidgatorFormatted].join('\n');
		if (k2sFormatted) {
			urls = `Try out online streaming option with K2S now !\nK2S支持在線播放啦，快來試壹試吧 !\n` + urls;
		}
		return `[url=https://jvrlibrary.com/?from=javlibrary-${encodeURIComponent(code)}][img]https://jvrlibrary.com/static/buro.gif[/img][/url]\n\n\n[url=https://jvrlibrary.com/?from=javlibrary-${encodeURIComponent(code)}][b]Visit jvrlibrary.com for More Japan VR videos !! Go FUUUNNNNKKKKYYYY !![/b]\n[b]更多日本VR影片請訂閱jvrlibrary.com ！！[/b][/url]\n\n` + urls;
	}

	wait(sec) {
		return new Promise(res => {
			setTimeout(res, sec * 1000)
		});
	}
}

module.exports = JavlibraryAutoPost;
