async function sliderLoadMoreAndInit() {
	if (!code) return;
	let preAndNext = await axios.get(`/preAndNext?code=${code}`),
		data = preAndNext.data,
		isMobile = navigator.userAgent.match(/mobile/i) && !navigator.userAgent.match(/ipad/i);

	var swiper = new Swiper('.swiper-container', {
	    slidesPerView: 'auto',
	    centeredSlides: true,
	    spaceBetween: isMobile ? 10 : 320,
	    navigation: {
	        nextEl: '.swiper-button-next',
	        prevEl: '.swiper-button-prev',
	    },
	    on: {
	    	slideChange: sliderOnChange
	    },
	    keyboard: true
	});

	window.swiper = swiper;
	swiper.appendSlide(data.next || []);
	swiper.prependSlide((data.pre || []));
	swiper.update();
	if ((data.next || []).length < 10 ) {
		swiper.noNextSlides = true;
	}
	if ((data.pre || []).length < 10 ) {
		swiper.noPreSlides = true;
	}
}
async function sliderOnChange() {
	let currentIndex = swiper.activeIndex,
		slidesCount = swiper.slides.length,
		currentCode = swiper.slides[currentIndex].getAttribute('data');

	currentCode && window.torrentService && window.torrentService(currentCode);

	if (swiper.loadingExtra) return;
	swiper.loadingExtra = true;
	
	if (slidesCount - currentIndex <= 2 && !swiper.noNextSlides) {
		let lastSlideCode = swiper.slides[slidesCount -1].getAttribute('data'),
			nextSlides = await axios.get(`/preAndNext?code=${lastSlideCode}&next=true`),
			data = nextSlides.data;

		swiper.appendSlide(data.next || []);
		swiper.update();
		if ((data.next || []).length <  10 ) {
			swiper.noNextSlides = true;
		}
	} else if (currentIndex <= 2 && !swiper.noPreSlides) {
		let firstSlideCode = swiper.slides[0].getAttribute('data'),
			preSlides = await axios.get(`/preAndNext?code=${firstSlideCode}&pre=true`),
			data = preSlides.data;
		
		swiper.prependSlide((data.pre || []));
		swiper.update();
		if ((data.pre || []).length <  10 ) {
			swiper.noPreSlides = true;
		}
	}
	JboxReinit(currentCode);
	swiper.loadingExtra = false;

}

function JboxReinit(code) {
	new jBox('Image');	
	window.jBoxVideo = null;
	if ($(`#video-button${code}`)) {
		window.jBoxVideo = new jBox('Modal', {
			width: '100%',
			height: 'auto',
			attach: `#video-button${code}`,
			content: `<video controls><source src="${$(`#video-button${code}`).attr('data')}"/></div>`,
			onClose: () => {
				$("video").get(0) && $('video').get(0).pause();
			}
		});
	}
}

sliderLoadMoreAndInit();
