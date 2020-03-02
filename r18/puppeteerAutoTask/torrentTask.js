const NodeCache = require('node-cache');
const nodeCache = new NodeCache({ 
	stdTTL: 60 * 60 * 24 * 3, // 3 days 
	checkperiod: 120
});
var http = require('http');
const puppeteer = require('puppeteer');
const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.122 Safari/537.36";
const fs = require('fs');
const url = require('url');
injectLogger();



function injectLogger() {
	var log_file = fs.createWriteStream(__dirname + `/${+new Date()}debug.log`, {flags : 'w'});

	var fn = process.stdout.write;
	function write() {
	  fn.apply(process.stdout, arguments);
	  log_file.write.apply(log_file, arguments);
	}
	process.stdout.write = write;
}


class TorrentTask {
	constructor() {
		this.init();
		setInterval(() => {
			this.page1Task._push({
				type: 'clearCache',
				task: this.clearCache.bind(this, this.page1)
			});
			this.page2Task._push({
				type: 'clearCache',
				task: this.clearCache.bind(this, this.page2)
			});
		}, 1000 * 60 * 10);
	}

	async init() {
		this.browser = await puppeteer.launch({
			headless: false
		});
		await this.createNewPage('page1');
		await this.createNewPage('page2');
	}

	async createNewPage(name) {
		this[name] = await this.browser.newPage();
		await this[name].setUserAgent(userAgent);
		await this[name].goto(`https://torrentz2.eu/`);
		this[name + 'Task'] = [];
		this[name + 'Task']._push = async function(task) {
			this.push(task);
			while(this.length) {
				await this[0].task();
				this.shift();
			}
		}
	}


	async getTorrentHanlder(code) {
		let target = this.page1Task.length <=  this.page2Task.length ? this.page1Task : this.page2Task,
			targetPage = this.page1Task.length <=  this.page2Task.length ? this.page1 : this.page2;

		let returnPromise = new Promise((resolve, reject) => {
			let task = this.findTorrent.bind(this, targetPage, code, {
				resolve,
				reject
			});
			target._push({
				type: 'torrent',
				task
			});	
		});	
		return returnPromise
	}

	async findTorrent(page, code, callback) {

		return new Promise(async (resolve, rej) => {
			setTimeout(rej, 2000);
			await page.goto(`https://torrentz2.eu/search?f=${code.replace('-', '+')}`);
			let res = await page.evaluate(function() {
				try {
					let results = document.getElementsByClassName('results')[0],
						dl = results.getElementsByTagName('dl')[0],
						dt = dl.getElementsByTagName('dt')[0],
						aTag = dt.getElementsByTagName('a')[0],
						href = aTag.href,
						title = aTag.text;

					let dd = dl.getElementsByTagName('dd')[0],
						span = dd.getElementsByTagName('span')[1],
						time = span.innerText;

					let magnet = (href || '').split('/').pop();

					if (magnet && title && time) {
						return {
							magnet,
							title,
							time
						}
					} else {
						return null
					}
				} catch(e) {
					return null;
				}
			})

			if (res) {
				callback.resolve(res)
				resolve(res);
			} else {
				callback.reject();
				rej();
			}
		})
	}

	async clearCache(target) {
		const client = await target.target().createCDPSession();
		await client.send('Network.clearBrowserCookies');
		await client.send('Network.clearBrowserCache');
	}

}

let TorrentPuppeteer = new TorrentTask(),
	getTorrentHanlder = TorrentPuppeteer.getTorrentHanlder.bind(TorrentPuppeteer);
//create a server object:
http.createServer(async function (req, res) {
	if (req.url.match(/^\/torrent/)) {
		let query = url.parse(req.url, true).query;
		let result = nodeCache.get(query.code)
		try {
			result = JSON.parse(result);
		} catch(e) {
			nodeCache.set(query.code, '');
			result = '';
		}
		if (!result) {
			try {
				result = await getTorrentHanlder(query.code);
				nodeCache.set(query.code, JSON.stringify(result))
			} catch(e) {
				result = '';
				nodeCache.set(query.code, '');
			}
		}
		console.log(`search for ${query.code} returning ${JSON.stringify(result || {})}`)
		res.write(JSON.stringify(result || {} ));
		res.end();
	}
}).listen(8001);
