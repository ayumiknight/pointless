const tryGetRapidgatorLinkJavArchive = require('./tryGetRapidgatorLinkJavArchive.js');
const tryGetTezLinkAvcens = require('./tryGetTezLinkAvcens.js');
const tryGetK2sLinkJpPorn = require('./tryGetK2sLinkJpPorn.js');
const tezToK2sRp = require('./tezToK2sRp');
const k2sToK2s = require('./k2sToK2s');
const md5ToK2s = require('./md5ToK2s');
const tezToK2sUsingP = require('./tezToK2sUsingP')
async function crawlAndSaveSingle({
    code,
    R,
    vr,
    source = {},
    extra, // extra crawled last time
    P
}) {
    let javInfo1,
        javInfo2,
        rapidgator = [],
        k2s = [],
        _jpOrgK2s = [];

    if (!vr) {
        javInfo1 = await tryGetRapidgatorLinkJavArchive({
            code
        });
        let myLinks = await R.saveLinksToFolder({
            name: code,
            fileLinks: javInfo1.rapidgator
        });
        rapidgator = myLinks || [];

        const reference = (extra && extra.rapidgator || []).length ? extra.rapidgator : rapidgator;
        const filesInfo = await R.getFileInfoByLinks(reference);
        k2s = await md5ToK2s({
            code,
            filesInfo,
            vr,
            javInfo: javInfo1,
            P
        })
    } else {
        const {
            jpOrgK2s = [],
            tez = []
        } = source

        if (!tez || !tez.length) {
            javInfo2 = await tryGetTezLinkAvcens({
                code
            })
            k2s = await tezToK2sUsingP({
                javInfo: javInfo2,
                code,
                vr,
                P
            })
        }
        if (!jpOrgK2s.length || Math.max(tez.length, ((javInfo2 && javInfo2.tezFiles) || []).length) > jpOrgK2s.length) {
            _jpOrgK2s = await tryGetK2sLinkJpPorn({
                code
            })
            
        }
    }

    return {
        k2s: k2s,
        tez: (javInfo2 && javInfo2.tezFiles) || [],
        jpOrgK2s: _jpOrgK2s || [],
        rapidgator: rapidgator,
        javarchiveHref: javInfo1 && javInfo1.href,
        avcensHref: javInfo2 && javInfo2.href
    }
}
module.exports = crawlAndSaveSingle;
