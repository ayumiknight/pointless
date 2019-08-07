const router = require('koa-router')();
const fs = require('fs');

const index = fs.readFileSync(__dirname + '/static/index.html', 'utf8');
const wordpress = require('wordpress');
const util = require('./google-util.js');

console.log(index, 'here is index============')
//initialize file read
async function boot() {
	await util.sync();
	await util.getFirstAvailable();
}
boot();

//initialize wordpress client
const client = wordpress.createClient({
    url: "https://www.point4.club",
    username: "point",
    password: "1414914fdysg",

});


router.use( async ( ctx, next) => {
	ctx.ok = function (result) {
		ctx.response.status = 200;
		ctx.body = JSON.stringify({result});
	}
	ctx.error = function(error) {
		ctx.response.status = 500;
		ctx.body = JSON.stringify({error})
	}
	await next();
})

router.get('/boot', async (ctx, next) => {
	let tags = await new Promise((resolve, reject) => {
		client.getTerms("post_tag",function(error, result) {
			if (error) {
				reject(error)
			} else {
				resolve(result)
			}
		})
	})
	let categories = await new Promise((resolve, reject) => {
		client.getTerms("category",function(error, result) {
			if (error) {
				reject(error)
			} else {
				resolve(result)
			}
		})
	})
	ctx.ok({
		tags,
		categories
	});
	return;
})

router.get('/getone', async (ctx, next) => {
	let result = await util.getCurrentEntry();
	await util.stepToNext();
	ctx.ok(result);
	return;
})


router.post('/save', async (ctx, next) => {
	try {
		let result = await new Promise((resolve, reject) => {
			client.newPost(ctx.args, function(error, result) {
				if (error) {
					reject(error)
				} else {
					resolve(result)
				}
			})
		})
		ctx.ok(result);

	} catch(e) {
		ctx.error(e);

	}	
	return;

	
	// client.newPost({
	// 	title: 'legend-of-cocaine-island-coordinates1',
	// 	type: 'post',
	// 	format: 'standard',
	// 	content: 'tests post',
	// 	excerpt: 'excerpt',
	// 	thumbnail: 1087,
	// 	terms: {
	// 		post_tag: [51],
	// 		category: [22]
	// 	}
	// }, function( error, res) {
	// 	console.log(error, res)
	// })
})

router.get('/', async (ctx, next) => {
	ctx.response.status = 200;
	ctx.body = index;
	console.log('final value', index)
	await next();
})

module.exports = router;



// client.getPost( 1114, function( error, post ) {
// 	console.log(error)
//     console.log(post);
// });

// client.getPostTypes( function(error, types) {
// 	console.log(error, types)
// })
// {
//   "title": "Calle Sarandi",
//   "description": "Sarandí Street is the principal pedestrian street of Ciudad Vieja in Montevideo, Uruguay and is the most frequented touristic place in the city.",
//   "panoid": "OnyTygRObM_hTLLdY4c5Vw",
//   "lat": "-34.907483",
//   "lng": "-56.204653",
//   "pitch": "-19.54",
//   "heading": "77.02",
//   "source": "https://es.wikipedia.org/wiki/Peatonal_Sarand%C3%AD"
// }
