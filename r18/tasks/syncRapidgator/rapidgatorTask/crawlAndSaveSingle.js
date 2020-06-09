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
        
        let [series, id] = code.split(' ');
        if (id * 1 > 100 && (id.length === 3)) {
        	console.log(e.message);
        	javInfo = null;
        	code = series + ' 0' + id;
        	javInfo = await tryGetRapidgatorLinkJavArchive({
	            code 
	        });
	        let myLinks = await R.saveLinksToFolder({
	            name: code,
	            fileLinks: javInfo.rapidgator
	        });
	        javInfo.rapidgator = myLinks;
	        console.log(`${code } javInfo found by javarchive\n`)
        } else {
        	throw new Error(e.message);
        }
        
    }

    return javInfo;
}

module.exports = crawlAndSaveSingle;