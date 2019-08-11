const router = require('koa-router')();
const fs = require('fs');

const index = fs.readFileSync(__dirname + '/static/index.html', 'utf8');
const wordpress = require('wordpress');
const util = require('./google-util.js');
const multer = require('koa-multer');
const storage = multer.memoryStorage();
const parseImage = multer({ storage }).single('image');
const bodyparser = require('koa-bodyparser');
console.log(index, 'here is index============')
//initialize file read
async function boot() {
	await util.sync();
	await util.getFirstAvailable();
}
boot();

//initialize wordpress client
const client = wordpress.createClient({
    url: "http://point4.cn",
    //url: "https://www.point4.club",
    username: "point",
    password: "1414914fdysg",

});


// var test = { "title": "Isla de Flores", "type": "post", "format": "standard", "content": "<!-- wp:paragraph -->\n\t\t\t<p>Location:  Isla de Flores</p>\n\t\t<!-- /wp:paragraph -->\n\n\t\t<!-- wp:paragraph -->\n\t\t\t<p>Coordinates: &nbsp; -34.945815, -55.932452</p>\n\t\t<!-- /wp:paragraph -->\n\t\t\n\t\t<!-- wp:image {\"id\":1047} -->\n\t\t\t<figure class=\"wp-block-image\"><img src=\"\" alt=\"\" class=\"wp-image-1047\"/></figure>\n\t\t<!-- /wp:image -->\n\n\t\t<!-- wp:html -->\n\t\t<figure>\n\t\t\t<iframe src=\"\" width=\"600\" height=\"450\" frameborder=\"0\" style=\"border:0\" allowfullscreen=\"\"></iframe>\n\t\t</figure>\n\t\t<!-- /wp:html -->", "excerpt": "The Isla de Flores is a small island in the Rio de la Plata, belonging to Uruguay. Has a historical lighthouse; it was part of the Treaty of La Farola in 1819, by which the Band lost the Eastern Oriental Missions. This lighthouse, construction of Portuguese origin, entered service in 1828. It is nicknamed \" World's most expensive lighthouse”. It is currently under the jurisdiction of the Uruguayan Navy and has 37 meters of height and emits two flashes every 10 seconds.", "thumbnail": { "thumbnail": 1417}, "terms": { "post_tag": [], "category": ["22", "23", "168", "195", "197"] }, "customFields": [{ "key": "coordinates", "value": "-55.932452" }] }

// client.newPost(test, function(error, result) {
//   console.log(error, result);
// })



router.use(bodyparser({
	detectJSON: function (ctx) {
		return /json/i.test(ctx.request.type);
	}
}));
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

router.get('/terms', async (ctx, next) => {
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
	let result = await util.getCurrentEntry(ctx.query || {});
	await util.stepToNext();
	ctx.ok(result);
	return;
})


router.post('/save', async (ctx, next) => {

	try {
		let result = await new Promise((resolve, reject) => {
			client.newPost(ctx.request.body, function(error, result) {
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
})
router.post('/upload', async (ctx, next) => {
	await parseImage(ctx);
	let { originalname, buffer } = ctx.req.file;
	console.log(originalname, `img/${originalname.split('.')[1]}`)
	try {
		let result = await new Promise((resolve, reject) => {
			client.uploadFile({
				name: originalname,
				type: `img/jpeg`,
				bits: buffer,
				overwrite: true
			}, function(error, result) {
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
})

router.get('/', async (ctx, next) => {
	ctx.response.status = 200;
	ctx.body = index;

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
