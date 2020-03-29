

const puppeteer = require('puppeteer');
const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36";
const fs = require('fs');
const url = require('url');
const axios = require('axios');
const javlibraryConf = require('./javlibraryConf.js');
const md5 = require('md5');

// injectLogger();

// //https://www.jvrlibrary.com/jvr?id=${_code}&raw=1

// function injectLogger() {
// 	var log_file = fs.createWriteStream(__dirname + `/${+new Date()}debug.log`, {flags : 'w'});

// 	var fn = process.stdout.write;
// 	function write() {
// 	  fn.apply(process.stdout, arguments);
// 	  log_file.write.apply(log_file, arguments);
// 	}
// 	process.stdout.write = write;
// }

class JavlibraryAutoPost {
	constructor(browser) {
		this.browser = browser;
		this.init();
		this.id = 1;
		this.captchaMap = {};
	}

	async init() {
		this.page = await this.browser.newPage();
		this.page.setDefaultNavigationTimeout(5 * 60 * 1000);
		await this.page.setUserAgent(userAgent);
		//await this.syncCaptcha();
		//await this.login();
		//this.beginTask();
	}

	async syncCaptcha() {
		//http://www.javlibrary.com/en/myaccount.php

		fs.readdirSync('./captcha').map(f => {
			let [name, ext] = f.split('.'),
				[hash, value] = name.split('-');
			this.captchaMap[hash] = value || 'null';
		});
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


	async login() {
		//http://www.javlibrary.com/en/myaccount.php
		await this.page.goto('http://www.javlibrary.com/en/login.php');
		await this.page.waitForNavigation();
		let res = await page.evaluate(function() {
			document.getElementById('userid').value = javlibraryConf.username;
			document.getElementById('password').value = javlibraryConf.password;
			return document.getElementById('confirmobj').src;
		});
	}

	async beginTask() {
		while(true) {
			await this.checkAndPostSingle();
		}
	}

	async checkAndPostSingle() {
		let res = await axios.get(`http://localhost:8080/rapidgator?raw=1&page=${this.id}&pagesize=1`);
		let response = JSON.parse(res.response);
		let row = response.rows[0];
		let code = row.code;
		let javlibrary = row.javlibrary;

		if (javlibrary) return;
		
		await this.page.goto(`https://www.javlibrary/en/vl_searchbyid.php?keyword=${code.replace('3DSVR', 'DSVR').replace('-', '+')}`);
		await this.page.waitForNavigation();
		let extras = row.Extras;
		let rapidgator = JSON.parse(extras.extra).rapidgator;

				// await setCurrentID(currentID + 1);
				// textArea.value = formatEntry(rapidgator)
				// stop = true;
		let responseFromConnect = await new Promise((res, rej) => {
			chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
		        chrome.tabs.sendMessage(tabs[0].id, { code }, function(response) {
		        	console.log(response)
		        	res(response)
		        });
		    });
		    setTimeout(rej, 4000)
		})
	}

	formatEntry(rapidgator) {
		let rapidgatorFormatted = rapidgator.map(link => {
			return `[url=${link}]${link}[/url]\n`;
		}).join('');

		return `[url=https://jvrlibrary.com/rapidgator][img]https://jvrlibrary.com/static/jvrslogan-sm.jpg[/img][/url]\n\n\n[url=https://jvrlibrary.com/rapidgator][b]Japan VR Porn Download !! All in Rapidgator or Torrents !! Have FUUUNNNN !![/b][/url]\n\n\n` + rapidgatorFormatted;
	}

}

module.exports = JavlibraryAutoPost;
// async function test() {
// 	let browser = await puppeteer.launch({
// 		headless: false,
// 		args: [
// 	      '--proxy-server=http://127.0.0.1:1080',
// 	    ],
// 	});
// 	let Javlibrary = new JavlibraryAutoPost(browser);
// }

// test();