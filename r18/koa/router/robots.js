
module.exports = async (ctx, next) => {
	
	ctx.body = `
		User-agent: *
		Allow: /
		Sitemap: https://jvrlibrary.com/sitemap
	`
	return;
	
} 