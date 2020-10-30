const tryGetRapidgatorLinkJavArchive = require('./tryGetRapidgatorLinkJavArchive.js');
const tryGetTezLinkAvcens = require('./tryGetTezLinkAvcens.js');
const tezToK2sRp = require('./tezToK2sRp');
const k2sToK2s = require('./k2sToK2s');
async function crawlAndSaveSingle({
    code,
    R,
    vr
}) {
    let javInfo;
        
    try {
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
    } catch(e) {
        if (vr) {
            javInfo = await tryGetTezLinkAvcens({
                code
            })
    
            await tezToK2sRp({
                javInfo,
                R,
                code
            })
        } else {
            throw e
        }
    }
    if (!javInfo || !javInfo.k2s) {
        throw new Error(code + 'not found at crawl single========')
    }
    return {
        k2s: javInfo.k2s,
        rapidgator: javInfo.rapidgator,
        href: javInfo.href
    }
}

module.exports = crawlAndSaveSingle;