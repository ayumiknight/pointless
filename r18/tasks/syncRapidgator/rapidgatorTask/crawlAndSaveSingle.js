const tryGetRapidgatorLinkJavArchive = require('./tryGetRapidgatorLinkJavArchive.js');
const tryGetRapidgatorLinkBlogJav = require('./tryGetRapidgatorLinkBlogJav.js');


async function crawlAndSaveSingle({
    code,
    R
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
        console.log(`${code } javInfo found by javarchive\n`)
    } catch (e) {
        console.log(e.message);
        javInfo = null;
        javInfo = await tryGetRapidgatorLinkBlogJav({
            code
        });
        let myLinks = await R.saveLinksToFolder({
            name: code,
            fileLinks: javInfo.rapidgator
        });
        javInfo.rapidgator = myLinks;
        console.log(`${code } javInfo found by blogjav\n`)
    }

    return javInfo;
}

module.exports = crawlAndSaveSingle;