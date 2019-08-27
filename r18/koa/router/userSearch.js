const { CategoryPaged } = require('../../sequelize/methods/categories.js');

module.exports = async (ctx, next) => {
	let { search } = ctx.query,
		number = search.match(/\d{2,8}/) && search.match(/\d{2,8}/)[0],
		letter = search.match(/[0-9a-zA-Z]+/) && search.match(/[0-9a-zA-Z]+/)[0];
	letter = ("" || letter).toUpperCase();

	if (number && letter) {
		ctx.redirect(`/jvr?id=${encodeURIComponent(letter + '-' + number)}`);
	} else if (letter) {
		ctx.redirect(`/lcode?lcode=${letter}`);
	} 

	return;
}
