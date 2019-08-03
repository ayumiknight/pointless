const cheerio = require('cheerio');
const { getIdFromUrl, getDuration, getText, getTextWithId, getActress, getTitle } = require('../util.js');


function parseEntry(entry) {
	var $ = cheerio.load(entry.data, {
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
	    Galleries = [],
	    Actresses = [],
	    Categories = [],
	    title = getTitle($('.product-details-page h1'));

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
	                    formattedDetails.Studio = getTextWithId({
	                    	node: $(this),
	                    	textName: 'en',
	                    	idName: 'studio_id'
	                    })
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
	                    formattedDetails.Series = getTextWithId({
	                    	node: $(this),
	                    	textName: 'en',
	                    	idName: 'series_id'
	                    })
	                    break;
	                default:
	                    break;

	            }
	        }
		})
	})

	actressDom.each(function(i, node) {
		let actress = getActress({
			node: $(this),
			textName: 'en'
		});
		actress ? Actresses.push(actress) : null;
	})

	categoryDom.each(function(i, node) {
		let category = getTextWithId({
        	node: $(this),
        	textName: 'en',
        	idName: 'category_id'
        })
		category ? Categories.push(category) : null;
	})

	galleryDom.each(function(i, node) {
		let imgSrc = $(this).find('img').attr('data-original');
		if (imgSrc) Galleries.push({
			url: imgSrc
		});
	})


	return {
		...formattedDetails,
		Actresses,
		Galleries,
		Categories,
		referer: entry.config.url,
		title
	}
};


module.exports = parseEntry;
