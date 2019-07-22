const cheerio = require('cheerio');
const { getIdFromUrl, getDuration, getText, getTextWithId, getActress } = require('./util.js');
const sampleTempate = require('./sampleEntry.js');

function parseEntry(dom) {
	var $ = cheerio.load(dom, {
	    xml: {
	        normalizeWhitespace: true,
	        decodeEntities: true
	    }

	});




	let cover = $('.product-area .product-image img').attr('src'),
		fullCover = $('.detail-view.detail-single-picture img').attr('src'),
	    video = $('.product-area .product-sample a').attr('data-video-high') || $('.product-area .product-sample a').attr('data-video-med'),
	    details = $('.product-area .product-details'),
	    galleryDom = $('.product-area .product-gallery.preview-grid li'),
	    actressDom = $('.product-box .product-actress-list .pop-list > span'),
	    categoryDom = $('.product-box .product-categories-list .pop-list > a'),
	    formattedDetails = {
	        cover,
	        fullCover,
	        video
	    },
	    gallery = [],
	    actress = [],
	    category = [];

	details.find('dl').each(function( i, dl ) {
		$(this).find('dd').each(function(j, dd) {
			if (i === 0) {
	            switch (j) {
	                case 0:
	                    formattedDetails.released = getText($(this));
	                    break;
	                case 1:
	                    formattedDetails.duration = getDuration($(this));
	                    break;
	                case 2:
	                    formattedDetails.director = getText($(this));
	                    break;
	                case 3:
	                    formattedDetails.studio = getTextWithId($(this))
	                    break;
	                default:
	                    break;
	            }
	        } else {
	            switch (j) {
	                case 0:
	                    formattedDetails.channel = getText($(this));
	                    break;
	                case 2:
	                    formattedDetails.code = getText($(this));
	                    break;
	                case 3:
	                    formattedDetails.series = getTextWithId($(this))
	                    break;
	                default:
	                    break;

	            }
	        }
		})
	})

	actressDom.each(function(i, node) {
		actress.push(getActress($(this)));
	})

	categoryDom.each(function(i, node) {
		category.push(getTextWithId($(this)));
	})

	galleryDom.each(function(i, node) {
		let imgSrc = $(this).find('img').attr('data-original');
		if (imgSrc) gallery.push(imgSrc);
	})

	console.log({
		...formattedDetails,
		actress,
		gallery,
		category
	})
	return {
		...formattedDetails,
		actress,
		gallery,
		category
	}
};

parseEntry(sampleTempate);

module.exports = parseEntry;
