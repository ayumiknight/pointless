const tryGetRapidgatorLinkJavArchive = require('./tryGetRapidgatorLinkJavArchive.js');
const tryGetTezLinkAvcens = require('./tryGetTezLinkAvcens.js');
const tezToK2sRp = require('./tezToK2sRp');
const k2sToK2s = require('./k2sToK2s');
const md5ToK2s = require('./md5ToK2s');
const tezToK2sUsingP = require('./tezToK2sUsingP')
async function crawlAndSaveSingle({
    code,
    R,
    vr,
    needK2s,
    needRp,
    extra, // extra crawled last time
    P
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
        if (needK2s && javInfo1.k2s.length) {
            const reference = (extra && extra.rapidgator || []).length ? extra.rapidgator : rapidgator;
            const filesInfo = await R.getFileInfoByLinks(reference);
            k2s = await md5ToK2s({
                code,
                filesInfo,
                vr,
                javInfo: javInfo1,
                P
            })
        }  
    } catch(e) {
        if (needK2s && !javInfo1 && vr) {
            javInfo2 = await tryGetTezLinkAvcens({
                code
            })
            k2s = await tezToK2sUsingP({
                javInfo: javInfo2,
                code,
                vr,
                P
            })
        } else {
            throw e
        }
    }
    if (!k2s.length && !rapidgator.length) throw new Error('something wrong , no link crawled===', code)
    
    let partialOk

    try {
        if (!extra) {
            if (javInfo1 && javInfo1.rapidgator.length !== rapidgator.length) partialOk = 1;
            if (javInfo1 && k2s.length && (k2s.length !== javInfo1.k2s.length)) partialOk = 1;
            if (javInfo2 && k2s.length != javInfo2.tezFiles.length) partialOk = 1;
        } else {
    
        }
    } catch(e) {
        console.log(e, '==========detect partioal ok wrong=========')
    }
    
    

    return {
        k2s: k2s,
        rapidgator: rapidgator,
        javarchiveHref: javInfo1 && javInfo1.href,
        avcensHref: javInfo2 && javInfo2.href,
        partialOk
    }
}
module.exports = crawlAndSaveSingle;