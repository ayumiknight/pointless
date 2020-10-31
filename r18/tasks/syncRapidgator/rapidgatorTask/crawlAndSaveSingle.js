const tryGetRapidgatorLinkJavArchive = require('./tryGetRapidgatorLinkJavArchive.js');
const tryGetTezLinkAvcens = require('./tryGetTezLinkAvcens.js');
const tezToK2sRp = require('./tezToK2sRp');
const k2sToK2s = require('./k2sToK2s');
async function crawlAndSaveSingle({
    code,
    R,
    vr,
    needK2s,
    needRp
}) {
    let javInfo1,
        javInfo2,
        rapidgator = [],
        k2s = [];

    try {
        javInfo1 = await tryGetRapidgatorLinkJavArchive({
            code
        });
        if (needRp) {
            let myLinks = await R.saveLinksToFolder({
                name: code,
                fileLinks: javInfo1.rapidgator
            });
            rapidgator = myLinks || [];
        }
        if (needK2s) {
            await k2sToK2s({
                code,
                javInfo: javInfo1
            })
            k2s = javInfo1.k2s || []
        }  
    } catch(e) {
        if (needK2s && !k2s.length) {
            javInfo2 = await tryGetTezLinkAvcens({
                code
            })
    
            await tezToK2sRp({
                javInfo: javInfo2,
                R,
                code
            })
            k2s = javInfo2.k2s || []
        } else {
            throw e
        }
    }

    return {
        k2s: k2s,
        rapidgator: rapidgator,
        javarchiveHref: javInfo1 && javInfo1.href,
        avcensHref: javInfo2 && javInfo2.href
    }
}
module.exports = crawlAndSaveSingle;