import React from 'react';
import BasicMap from '../components/basic-map.jsx';
import PointsGallery from '../components/points-gallery.jsx';
import Banner from '../components/banner.jsx';
import GallerySwiper from '../components/gallery-swiper.jsx';
import { Tabs } from 'antd';
const { TabPane } = Tabs;
import slides from '../data/satelliteViews.js';

export default class ExplorePage extends React.Component {

  componentDidMount() {
  	window.mapReady = this.ready.bind(this);
  	this.injectScript();
  }

  injectScript() {
    var tag = document.createElement('script');
    tag.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAKS2H1asoA5XK3P4QQBCfl7nySqefctbs&callback=mapReady";
    document.body.append(tag);
  }
  ready() {
  	this.setState({
  		ready: true
  	});
  }

  render() {

    return <div className="gallery-page">
    	  <Tabs defaultActiveKey="1" size="large" animated={false}>
          <TabPane tab={<div>Gallery</div>} key="1">
            <GallerySwiper slides={slides}/>
          </TabPane>
        </Tabs>
    </div>;
  }
}
