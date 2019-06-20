import React from 'react';
import BasicMap from '../components/basic-map.jsx';
import PointsGallery from '../components/points-gallery.jsx';
import Banner from '../components/banner.jsx';
import GallerySwiper from '../components/gallery-swiper.jsx';
import { Tabs } from 'antd';
const { TabPane } = Tabs;
import slides from '../data/satelliteViews.js';

require('../style/hello.less');
export default class Hello extends React.Component {

  componentDidMount() {

  }


  render() {
  	let { ready } = this.state || {};
    return <div className="hello">
      <Banner />

    	{this.props.children}
    </div>;
  }
}
