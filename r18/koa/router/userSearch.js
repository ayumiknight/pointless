const { CategoryPaged } = require('../../sequelize/methods/categories.js');

module.exports = async (ctx, next) => {
	let { search } = ctx.query,
		number = search.match(/\d+/) && search.match(/\d+/)[0],
		letter = search.match(/[a-zA-Z]+/) && search.match(/[a-zA-Z]+/)[0];
  	console.log(number, letter ,'============')
	if (number && letter) {
		ctx.redirect(`/jvr?id=${encodeURIComponent(letter + '-' + number)}`);
	} else if (letter) {
		ctx.redirect(`/?lcode=${letter}`);
	} 

	return;
}
