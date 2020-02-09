const {
    getR18Paged,
    getMySelected,
    getCurrentClicks
} = require('../../sequelize/methods/index.js');

module.exports = async (ctx, next) => {
    
    if (ctx.path === '/sitemap') {
    	let all = 6,
    	i = 1,
    	content = [];

		while (i <= all) {
			content.push(`<sitemap>
				<loc>https://jvrlibrary.com/sitemap/sitemappage${i}.txt</loc>
			</sitemap>`);
			i++;
		}
	    ctx.body = `<?xml version="1.0" encoding="UTF-8"?>
			<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
			${content.join('')}
			</sitemapindex>`;

		return;
    } else {
    	let currentPage = ctx.path.replace(/^.*sitemappage(\d*).*$/, '$1');
    	if (!currentPage || !currentPage * 1 || currentPage * 1 > 7 || currentPage * 1 <= 0) {
    		ctx.body = 'You gotta be kidding me!'
    		return;
    	}

    	let res = await getR18Paged({
    		page: currentPage,
    		pagesize: 1000
    	});
    	ctx.body = (res.rows || []).map( elem => {
    		return `https://jvrlibrary.com/jvr?id=${elem.code}\n`
    	}).join('');
    	return;
    }
    
}