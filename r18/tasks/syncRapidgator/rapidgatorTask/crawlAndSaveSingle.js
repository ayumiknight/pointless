const tryGetRapidgatorLinkJavArchive = require('./tryGetRapidgatorLinkJavArchive.js');
const tryGetTezLinkAvcens = require('./tryGetTezLinkAvcens.js');
const rapidgator = require('./rapidgator');
const {
    tezToK2s,
    k2sToK2s,
    populateTezData
} = require('./k2sTez');
async function crawlAndSaveSingle({
    code,
    R,
    vr
}) {
    let javInfo;
    if (vr) {
        
        javInfo = await tryGetTezLinkAvcens({
            code
        })
        console.log('======javinfo= got======', javInfo)
        await populateTezData({
            javInfo
        });
        console.log('======populateTezData= got======', javInfo)
        await tezToK2s({
            code,
            javInfo
        })
        console.log('======tezToK2s= got======', javInfo)
        await R.tezToRp({
            code,
            javInfo
        })
        console.log('======tezToRp= got======', javInfo)
       
    } else {
     
        javInfo = await tryGetRapidgatorLinkJavArchive({
            code
        });
        let myLinks = await R.saveLinksToFolder({
            name: code,
            fileLinks: javInfo.rapidgator
        });
        javInfo.rapidgator = myLinks;
        await k2sToK2s({
            code,
            javInfo
        })
    }
    console.log({
        k2s: javInfo.k2s,
        rapidgator: javInfo.rapidgator,
        href: javInfo.href
    }, 'final crawl data============')
    return {
        k2s: javInfo.k2s,
        rapidgator: javInfo.rapidgator,
        href: javInfo.href
    }
}

async function test() {
    const R = new rapidgator()
    await R.login();
    await crawlAndSaveSingle({
        code: 'SIVR 096',
        vr: 1,
        R
    })
}
test()
module.exports = crawlAndSaveSingle;