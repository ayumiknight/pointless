const {
	getR18PagedAllowEmptyExtra
} = require('../../sequelize/methods/r18.js');
const appendOneTez = require('../../tasks/syncRapidgator/rapidgatorTask/appendOneTez');
const axios = require('axios');
const { _66, tezP } = require('../../tasks/syncRapidgator/rapidgatorTask/k2sConfig');
const getJpOrgRecent = require('../../tasks/syncRapidgator/rapidgatorTask/getJpOrgRecent');

global.tezTasks = [];
async function tezSchedule(ctx, next) {
  if (ctx.method === 'GET') {
    if (ctx.query.queue) {
      const queue = ctx.query.queue.split('|').map(el => {
        const [tezK2sId, r18Id, type, newName] = el.split('_');
        return {
          tezK2sId,
          r18Id,
          type,
          newName
        };
      })
      global.tezTasks = global.tezTasks.concat(queue);
      consumerTezTask()
      ctx.body = 'ok';
      return
    } else {
      const accountInfo = await Promise.all([
        axios({
          url: 'https://tezfiles.com/api/v2/accountInfo',
          method: 'POST',
          data: JSON.stringify({
            "access_token": tezP
          })
        }),
        axios({
          url: 'https://k2s.cc/api/v2/accountInfo',
          method: 'POST',
          data: JSON.stringify({
            "access_token": _66
          })
        }),
        getJpOrgRecent()
      ]);

      const trafficLeftTez = (accountInfo[0].data.available_traffic / 1024 / 1024 / 1024).toFixed(2);
      const trafficLeftK2s = (accountInfo[1].data.available_traffic / 1024 / 1024 / 1024).toFixed(2);
      const jpOrgRecent = accountInfo[2];

      const r18s = await getR18PagedAllowEmptyExtra({
        pagesize: 100,
        page: 1
      });
      let rows = r18s.rows;
      const rowsFormatted = [];
      rows = rows.map(el => {
        const temp = {
          code: el.code,
          cover: el.cover,
          createdAt: el.createdAt,
          extraCreatedAt: (el.Extras.createdAt + '').slice(0, 24),
          id: el.id
        }
        if (el.Extras.extra) {
          temp.extras = JSON.parse(el.Extras.extra)
        } else {
          temp.extras = {}
        }
        if (el.Extras.source) {
          temp.extras = {
            ...temp.extras,
            ...JSON.parse(el.Extras.source)
          }
        }
        return temp;
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
          tez = [],
          k2s = []
        } = el.extras;
        const jpOrgRecentMatch = jpOrgRecent.filter(recent => {
          const upperCase = recent.toUpperCase();
          const [series, id] = el.code.split('-');
          return upperCase.match(series) && upperCase.match(id);
        })
        const tezLength = tez.length;
        let index = 0;
        while(index < tezLength) {
          let formatted = [];
          if (!index) {
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
          const tezFileName = thisTez.split('/').pop().replace('avcens.xyz','jvrlibrary').replace('avcens', 'jvrlibrary');
          const thisK2s = k2s.find(one => {
            const k2sFileName = one.split('/').pop();
            return tezFileName === k2sFileName
          });
          const thisJpOrgK2s = jpOrgRecentMatch.pop();


          if (thisK2s) {
            formatted.push({
              value: thisTez
            })
          } else {
            const tezId = thisTez.replace(/^https\:\/\/tezfiles.com\/file\/([a-z0-9]+)\/.+$/, "$1");
            const isUnderGoing = global.tezTasks.find(one => {
              return one.tezK2sId === tezId
            })
            
            formatted.push({
              tezK2sId: tezId,
              r18Id: el.id,
              value: thisTez,
              disabled: !!isUnderGoing,
              type: 'tez',
              newName: tezFileName
            })
          }
         
          if (thisJpOrgK2s) {
            const k2sId = thisJpOrgK2s.replace(/^https\:\/\/k2s.cc\/file\/([a-z0-9]+)\/.+$/, "$1");
            const isUnderGoing = global.tezTasks.find(one => {
              return one.tezK2sId === k2sId
            })
            formatted.push({
              tezK2sId: k2sId,
              r18Id: el.id,
              value: thisJpOrgK2s,
              disabled: !!isUnderGoing,
              type: 'k2s',
              newName: tezFileName
            })
          } else {
            formatted.push({
              value: 'none'
            })
          }

          if (thisK2s) {
            formatted.push({
              value: thisK2s
            })
          } else {
            formatted.push({
              value: 'none'
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
        trafficLeftTez,
        trafficLeftK2s
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