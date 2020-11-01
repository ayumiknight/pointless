const tryGetRapidgatorLinkJavArchive = require('./tryGetRapidgatorLinkJavArchive.js');
const tryGetTezLinkAvcens = require('./tryGetTezLinkAvcens.js');
const tezToK2sRp = require('./tezToK2sRp');
const k2sToK2s = require('./k2sToK2s');
const md5ToK2s = require('./md5ToK2s');
const rapidgator = require('./rapidgator')
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
        console.log('first', javInfo1)
        if (needRp) {
            let myLinks = await R.saveLinksToFolder({
                name: code,
                fileLinks: javInfo1.rapidgator
            });
            rapidgator = myLinks || [];
        }
        if (needK2s && javInfo1.k2s.length) {
            const reference = (extra.rapidgator || []).length ? extra.rapidgator : rapidgator;
            console.log(reference, '=================reference=============')
            const filesInfo = R.getFileInfoByLinks(reference);
            console.log(reference, '=================filesInfo=============')
            k2s = await md5ToK2s({
                code,
                filesInfo
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
                    code
                })
            }
            if (javInfo2.k2s.length && (!k2s || !k2s.length)) {
                k2s = await k2sToK2s({
                    javInfo: javInfo2,
                    R,
                    code
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
async function test() {
    const R = new rapidgator();
    await R.login();
    const result = await crawlAndSaveSingle({
        code: 'SAVR-026',
        vr: 1,
        R,
        needK2s: true,
        needRp: false,
        extra: {"href":"http://javarchive.com/vr-scvr-026-%e3%83%aa%e3%82%a2%e3%83%ab%e6%82%aa%e5%be%b3%e3%82%a8%e3%82%b9%e3%83%86%e4%bd%93%e9%a8%93%ef%bc%81%e4%b8%80%e8%88%ac%e5%ae%a2%e3%81%ab%e5%aa%9a%e8%96%ac%e3%82%92%e9%a3%b2%e3%81%be/","pixhost":[{"thumb":"http://img.javstore.net/images/SCVR-026-A.mp4.th.jpg","link":"http://img.javstore.net/image/bztVJ6"},{"thumb":"http://img.javstore.net/images/SCVR-026-B.mp4.th.jpg","link":"http://img.javstore.net/image/bztaVh"},{"thumb":"http://img.javstore.net/images/SCVR-026-C.mp4.th.jpg","link":"http://img.javstore.net/image/bzttP8"},{"thumb":"http://img.javstore.net/images/SCVR-026-D.mp4.th.jpg","link":"http://img.javstore.net/image/bztMkk"},{"thumb":"http://img.javstore.net/images/SCVR-026-E.mp4.th.jpg","link":"http://img.javstore.net/image/bztNQb"}],"rapidgator":["http://rapidgator.net/file/ba16338fd73f91b10b52a53c17c33011/SCVR-026-A.mp4.html","http://rapidgator.net/file/ec6f6c0e960bbf38d0dd1aed123b112d/SCVR-026-B.mp4.html","http://rapidgator.net/file/4bea21b8680c078d5d61e5221e074cfe/SCVR-026-C.mp4.html","http://rapidgator.net/file/c3b34f0dd73442fd86c031dc83a1df68/SCVR-026-D.mp4.html","http://rapidgator.net/file/6767c0fa4a06c45ae2182fc2a3c9ee99/SCVR-026-E.mp4.html"],"javarchiveHref":"http://javarchive.com/vr-scvr-026-%e3%83%aa%e3%82%a2%e3%83%ab%e6%82%aa%e5%be%b3%e3%82%a8%e3%82%b9%e3%83%86%e4%bd%93%e9%a8%93%ef%bc%81%e4%b8%80%e8%88%ac%e5%ae%a2%e3%81%ab%e5%aa%9a%e8%96%ac%e3%82%92%e9%a3%b2%e3%81%be/"}
    })
    console.log(result)

}
test()
module.exports = crawlAndSaveSingle;