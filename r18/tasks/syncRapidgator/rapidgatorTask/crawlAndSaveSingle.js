const tryGetRapidgatorLinkJavArchive = require('./tryGetRapidgatorLinkJavArchive.js');
const tryGetTezLinkAvcens = require('./tryGetTezLinkAvcens.js');
const tezToK2sRp = require('./tezToK2sRp');
const k2sToK2s = require('./k2sToK2s');
const md5ToK2s = require('./md5ToK2s');
async function crawlAndSaveSingle({
    code,
    R,
    vr,
    needK2s,
    needRp,
    extra // extra crawled last time
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
                vr
            })
        }  
    } catch(e) {
        if (needK2s && !javInfo1 && vr) {
            javInfo2 = await tryGetTezLinkAvcens({
                code
            })
            if (javInfo2.tezFiles.length) {
                k2s = await tezToK2sRp({
                    javInfo: javInfo2,
                    R,
                    code,
                    vr
                })
            }
            if (javInfo2.k2s.length && (!k2s || !k2s.length)) {
                k2s = await k2sToK2s({
                    javInfo: javInfo2,
                    R,
                    code,
                    vr
                })
            }
            k2s = k2s || []
        } else {
            throw e
        }
    }
    if (!k2s.length && !rapidgator.length) throw new Error('something wrong , no link crawled===', code)
    return {
        k2s: k2s,
        rapidgator: rapidgator,
        javarchiveHref: javInfo1 && javInfo1.href,
        avcensHref: javInfo2 && javInfo2.href
    }
}
module.exports = crawlAndSaveSingle;