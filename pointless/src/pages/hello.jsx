import React from 'react';
import BasicMap from '../components/basic-map.jsx';
import PointsGallery from '../components/points-gallery.jsx';
import { Tabs } from 'antd';
const { TabPane } = Tabs;

require('../style/hello.less');
export default class Hello extends React.Component {

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
  	let { ready } = this.state || {};
    return <div className="hello">
	    <Tabs defaultActiveKey="1" size="large" animated={false}>
		  <TabPane tab={<div>Points<br/>
		    (life with points is pointless)</div>} key="1">
		    <PointsGallery ready={ready} />
		  </TabPane>
		  <TabPane tab={<div>Pointless<br/>
		    (need to find something)</div>} key="2">
		    <BasicMap ready={ready}/>
		  </TabPane>
		</Tabs>
    	
    </div>;
  }
}
