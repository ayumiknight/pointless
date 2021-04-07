

const { getR18WithExtraPaged } = require('../../sequelize/methods/r18.js');
const { sequelize, Sequelize, Extra } = require('../../sequelize/index.js');
const crawlAndSaveSingle = require('./rapidgatorTask/crawlAndSaveSingle.js');
const Rapidgator = require('./rapidgatorTask/rapidgator.js');
const PuppeteerMD5Fetcher = require('./rapidgatorTask/puppeteerMD5Fetcher');

let rapidgatorCodeFromArgv = process.argv.find(one => one.match(/^--rapidgatorCode(.+)$/))
let rapidgatorCode = rapidgatorCodeFromArgv ? rapidgatorCodeFromArgv.replace(/^--rapidgatorCode(.+)$/i, '$1') : '';
console.log(rapidgatorCode, '==========rapidgatorCode!!!!!!!!!!!!!!\n\n\n');


async function syncRapidgator() {
  let R = new Rapidgator();
  await R.login();
  let P = new PuppeteerMD5Fetcher({});
  await P.init();
  const rows = await getR18WithExtraPaged({
    page: 1,
    pagesize: 1,
    code: rapidgatorCode,
    vr
  });
  const row = rows[0]
  if (row.Extras && row.Extras.extra) {
    row.extra = JSON.parse(row.Extras.extra)
  }
  if (row.Extras && row.Extras.source) {
    row.source = JSON.parse(row.Extras.source)
  }
  syncRapidgatorSingle({
    row,
    R,
    vr,
    P
  })
}

async function syncRapidgatorSingle({
  row,
  R,
  vr,
  P
}) {
  let {
    id,
    code,
    source = {},
    Extras,
    extra = {}
  } = row;

  try {
    let extras = await crawlAndSaveSingle({
      code,
      R,
      vr,
      source,
      extra,
      P
    });
    if (!vr) {
      if (!extras.rapidgator.length) {
        console.log(`nonvr ${code} not found++++++++++++`)
        return
      }
      const ExtraInfo = {
        extra: JSON.stringify({
          rapidgator: extras.rapidgator,
          k2s: extras.k2s || []
        })
      }
      await Extra.findOrCreate({
        where: {
          R18Id: id
        },
        defaults: ExtraInfo
      });
    } else {
      let dirty = false
      extras.tez.length && (source.tez = extras.tez) && (dirty = true)
      extras.jpOrgK2s.length && (source.jpOrgK2s = extras.jpOrgK2s) && (dirty = true)

      if (!dirty) {
        if (!source.tez.length) {
          console.log(`vr ${code} not found++++++++++++`)
        } else {
          console.log(`vr ${code} not updated++++++++++++`)
        }
        return
      }
      if (!Extras) {
        const defaults = {
          source: JSON.stringify(source)
        }
        if (extras.k2s && extras.k2s.length) {
          defaults.extra = JSON.stringify({
            k2s: extras.k2s
          })
        }
        await Extra.findOrCreate({
          where: {
            R18Id: id
          },
          defaults
        });
      } else {
        await Extra.update({
          source: JSON.stringify(source)
        }, {
          where: {
            R18Id: id
          },
          silent: true
        });
      }
    }

    console.log(`${code} ${id} crawled and saved\n`);
  } catch (e) {
    console.log(`!!!!!!!!!!!!! ${code} ${id}==${e.message}\n`, e);
  }
}

syncRapidgator()
