const cheerio = require('cheerio');
const { getIdFromUrl, getDuration, getText, getTextWithId, getActress, getTitle, getCode } = require('../../util.js');


function parseEntry(entry) {
	let [ enEntry, zhEntry ] = entry;
	if (!enEntry || !zhEntry) return null;
	
	var $ = cheerio.load(enEntry.data, {
	    xml: {
	        normalizeWhitespace: true,
	        decodeEntities: true
	    }
	});
	let zh$ = cheerio.load(zhEntry.data, {
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
	    zhTitle = getTitle(zh$('.product-details-page h1'));

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
	                case 1:
	                	formattedDetails.backupCode = getCode(getText($(this)));
	                	break;
	                case 2:
	                    formattedDetails.code = getCode($(this));
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

	formattedDetails.code = formattedDetails.code || formattedDetails.backupCode;
	
	let code = formattedDetails.code,
		match = (code.split('-')[1] || code.split('-')[0]).match(/\d+/),
		coden = match && match[0] || 0;
	if (!code ) console.warn(`no code found at ${enEntry.config.url} !!!!!!!`);
	return {
		...formattedDetails,
		coden,
		Actresses,
		Galleries,
		Categories,
		referer: enEntry.config.url,
		title,
		zhTitle
	}
};


module.exports = parseEntry;
