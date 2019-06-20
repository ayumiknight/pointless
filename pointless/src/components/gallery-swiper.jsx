import React from 'react';

export default class GallerySwiper extends React.Component {

  componentDidMount() {
    this.gallerySwiper = new Swiper('#gallery-swiper.swiper-containe');
  }

  render() {
  	let { slides } = this.props;

    return <div id="gallery-swiper" className="swiper-containe">
    	<div class="swiper-wrapper">
	    	{ slides.map( slide => {
	    		return <div class="swiper-slide">
	    			<img src={slide.preview} />
	    			<div className="title">{ slide.title }</div>
	    			<div className="desc">{ slide.desc }</div>
	    		</div>;
	    	})}
    	</div>
    </div>;
  }
}
