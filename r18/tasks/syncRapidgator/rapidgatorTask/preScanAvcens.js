
const axios = require('axios');
const cheerio = require('cheerio');
const { sequelize, Sequelize, Extra } = require('../../../sequelize/index.js');
const { getR18Single } = require('../../../sequelize/methods/r18.js');
const syncRapidgatorSingle = require('./syncRapidgatorSingle.js');

class PreScanAvcens {
  constructor({
    P,
    R
  }) {
    this.P = P
    this.R = R
  }
  async checkAndSave(elem) {
    const { link, code } = elem;
    const r18 = await getR18Single({ code })
    if (r18 && r18.vr === 1) {
      console.log(`preScan caught ============${code}=====\n` )
      try {
        await syncRapidgatorSingle({
          r18,
          R: this.R,
          vr,
          P: this.P
        })
      } catch(e) {
        console.log(`syncRapidgatorSingle error ============${code}=====\n`)
      }
    }
  }

  async scanPage(page) {
    const pageUrl = page === 1 ? 'https://avcens.xyz/' : `https://avcens.xyz/page/${page}/`
    const res = await axios.get(pageUrl)
    const $ = cheerio.load(res.data)
    
    const entries = []
    $('.blog-entry-title a').each(function(i, elem) {
      const text = $(this).text().trim();
      const link = $(this).attr('href');
      if (text.match(/^(\w+-\d+)\s.+$/i)) {
        const code = text.replace(/^(\w+-\d+)\s.+$/i, '$1').toUpperCase()
        entries.push({
          code,
          link
        })
      }
    })
    if (entries.length) {
      let i = 0
      while(i < entries.length) {
        await this.checkAndSave(entries[i])
        i++
      }
    }
    
  }
  async scan(page) {
    let i = 1;
    while(i <= page) {
      await this.scanPage(i)
      i++
    }
  }
}

module.exports = PreScanAvcens
