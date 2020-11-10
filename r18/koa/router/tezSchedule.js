const {
	getR18PagedAllowEmptyExtra
} = require('../../sequelize/methods/r18.js');
const appendOneTez = require('../../tasks/syncRapidgator/rapidgatorTask/appendOneTez');
const axios = require('axios');

global.tezTasks = [];
async function tezSchedule(ctx, next) {
  if (ctx.method === 'GET') {
    if (ctx.query.queue) {
      const queue = ctx.query.queue.split('|').map(el => {
        const [tezId, r18Id] = el.split('_');
        return {
          tezId,
          r18Id
        };
      })
      global.tezTasks = global.tezTasks.concat(queue);
      consumerTezTask()
      ctx.body = 'ok';
      return
    } else {
      const accountInfo = await axios({
        url: 'https://tezfiles.com/api/v2/accountInfo',
        method: 'POST',
        data: JSON.stringify({
          "access_token": "842b30ea18349291d719facfbeb411f60ad48b91"
        })
      })
      const trafficLeft = (accountInfo.data.available_traffic / 1024 / 1024 / 1024).toFixed(2);
      const r18s = await getR18PagedAllowEmptyExtra({
        pagesize: 100,
        page: 1
      });
      let rows = r18s.rows;
      const rowsFormatted = [];
      rows = rows.map(el => {
        return {
          code: el.code,
          cover: el.cover,
          createdAt: el.createdAt,
          extras: JSON.parse(el.Extras.extra),
          extraCreatedAt: (el.Extras.createdAt + '').slice(0, 24),
          id: el.id
        };
      }).filter(el => {
        const {
          tez = [],
          k2s = []
        } = el.extras
        if (tez && tez.length) {
          if (k2s.length < tez.length) {
            return true;
          }
        }
        return false;
      })
      rows.forEach(el => {
        const {
          tez,
          k2s
        } = el.extras;
        const tezLength = tez.length;
        let index = 0;
        while(index < tezLength) {
          let formatted = [];
          if (!index) {
            formatted.push({
              cover: el.cover,
              rowSpan: tezLength
            })
            formatted.push({
              value: el.id,
              rowSpan: tezLength
            })
            formatted.push({
              value: el.code,
              rowSpan: tezLength
            })
            formatted.push({
              value: el.extraCreatedAt,
              rowSpan: tezLength
            })
            formatted.push({
              value: k2s.length + '/' + tez.length,
              rowSpan: tezLength
            })     
          }
          const thisTez = tez[index];
          const thisK2s = k2s.find(one => {
            const k2sFileName = one.split('/').pop();
            const tezFileName = thisTez.split('/').pop();
            return tezFileName.replace('avcens.xyz','jvrlibrary').replace('avcens', 'jvrlibrary') === k2sFileName
          });
          formatted.push({
            value: thisTez
          })
          if (thisK2s) {
            formatted.push({
              value: thisK2s
            })
          } else {
            const tezId = thisTez.replace(/^https\:\/\/tezfiles.com\/file\/([a-z0-9]+)\/.+$/, "$1");
            const isUnderGoing = global.tezTasks.find(one => {
              return one.tezId === tezId
            })
            formatted.push({
              click: tezId,
              id: el.id,
              disabled: !!isUnderGoing
            })
          }
          rowsFormatted.push(formatted);
          index++;
        }
      })
  
      const tezTasks = global.tezTasks
      ctx.body = ctx.dots.index({
        type: 'tezSchedule',
        tezScheduleTable: rowsFormatted,
        tezTasks,
        trafficLeft
      });
      return
    }
  }
}

async function consumerTezTask() {
  while(global.tezTasks.length) {
    const first = global.tezTasks.shift();
    try {
      await appendOneTez(first);
    } catch(e) {
      console.log(e, '==============tez Schedule error===========', first)
      if (e.message.match('Request failed with status code 406'))  {
        await new Promise(resolve => {
          setTimeout(resolve, 1000 * 60 * 60 * 3 );
        })
      }
    }
  }
}


module.exports = tezSchedule