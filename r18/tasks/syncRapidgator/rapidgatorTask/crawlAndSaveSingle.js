const tryGetRapidgatorLinkJavArchive = require('./tryGetRapidgatorLinkJavArchive.js');
const tryGetRapidgatorLinkBlogJav = require('./tryGetRapidgatorLinkBlogJav.js');
const tryGetTezLinkAvcens = require('./tryGetTezLinkAvcens.js');
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
        await populateTezData({
            javInfo
        });
        await tezToK2s({
            code,
            javInfo
        })
        await R.tezToRp({
            code,
            javInfo
        })
       
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
    return {
        k2s: javInfo.k2s,
        rapidgator: javInfo.rapidgator,
        href: javInfo.href
    }
}

module.exports = crawlAndSaveSingle;