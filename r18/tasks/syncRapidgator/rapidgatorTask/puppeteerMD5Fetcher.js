const puppeteer = require('puppeteer');

class PuppeteerMD5Fetcher {
  constructor({
    headful,
    firefox
  }) {
    this.headful = process.argv.find(one => one.match(/^--headful$/)) || headful;
		this.firefox = process.argv.find(one => one.match(/^--firefox$/)) || firefox;
  }

  async init() {
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

		
		console.log('starting options' , options)
		this.browser = await puppeteer.launch(options);
		let pages = await this.browser.pages();
		this.page = pages[0];
		this.page.setDefaultNavigationTimeout(5 * 60 * 1000);
  }

  async getRawDataFor({
    link,
    type //k2s or tez
  }) {
    return new Promise((resolve, reject) => {
      let fileId,
        interceptUrl;
      if (type === 'k2s') {
        fileId = link.replace(/^https\:\/\/k2s.cc\/file\/([a-z0-9]+)\/.+$/, "$1");
        interceptUrl = `https://api.k2s.cc/v1/files/${fileId}`
      } else {
        fileId = link.replace(/^https\:\/\/tezfiles.com\/file\/([a-z0-9]+)\/.+$/, "$1")
        interceptUrl = `https://api.tezfiles.com/v1/files/${fileId}`
      }
      this[fileId] = async (response) => {
        const url = response.url()
        if (url === interceptUrl) {
          resolve(response.text())
        }
      }
      setTimeout(reject, 1000 * 30)
      this.page.on('response', this[fileId])
      try {
        this.page.goto(link, {timeout : 100 * 1000 })
        this.page.off('response', this[fileId])
      } catch(e) {
        try {
          this.page.off('response', this[fileId])
        } catch(e) {

        }
        reject('timing out fetching =============', link)
      }
    })
  }


  async getMD5For({
    link,
    type //k2s or tez
  }) {
    try {
      const rawString = await this.getRawDataFor({
        link,
        type //k2s or tez
      })
      console.log(rawString, '============rawString got')
      return JSON.parse(rawString).videoPreview.video
    } catch(e) {
      return ''
    }
  }
}
async function test() {
  const P = new PuppeteerMD5Fetcher({});
  await P.init();
  let res
   res = await P.getMD5For({
    link: 'https://k2s.cc/file/2188425728d87/FC2-PPV-1551460.mp4',
    type: 'k2s'
  })
  console.log(res);
  res = await P.getMD5For({
    link: 'https://tezfiles.com/file/a9ef0a0156f37/SOAV-070.jvrlibrary.mp4',
    type: 'tez'
  })
  console.log(res);
}

test()