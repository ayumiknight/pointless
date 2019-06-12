import React from 'react';
import util from '../util.js';
require('./basic-map.less');
export default class BasicMap extends React.Component {

  componentDidMount() {
    window.initialize = this.initialize.bind(this);
    this.state = {};
    this.injectScript();
  }

  injectScript() {
    var tag = document.createElement('script');
    tag.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyAKS2H1asoA5XK3P4QQBCfl7nySqefctbs&callback=initialize";
    document.body.append(tag);
  }

  async initialize() {
    window.util = util;
    let initLocation = util.locations.commonLocations('newyork') || (await util.locations.myLocation());

    var map = new google.maps.Map(
      document.getElementById('map-instance'), {
        center: initLocation,
        zoom: 12,
        fullscreenControl: false
      });
    var pano = new google.maps.StreetViewPanorama(
      document.getElementById('pano'), {
        position: initLocation,
        pov: {
          heading: 0,
          pitch: 0
        },
        addressControl: false,
        fullscreenControl: false
      });
    map.setStreetView(pano);
    this.map = map;
    this.pano = pano;

    pano.addListener('pano_changed', () => {
      this.updatePanoInfo()
    });

    pano.addListener('position_changed', () => {
      this.updatePanoInfo()
    });

    pano.addListener('pov_changed', () => {
      this.updatePanoInfo()
    });
  }

  updatePanoInfo() {
    let currentPano = {
      position: this.pano.getPosition(),
      pov: this.pano.getPov(),
      panoId: this.pano.getPano()
    };
    this.setState({
      currentPano
    });
  }

  hideMap() {
    if (this.map) {
      this.map.setVisible(false);
    }
  }

  render() {
    return <div className="basic-map">
      <div id="map-instance"></div>
      <div id="pano"></div>
      <button onClick={this.hideMap.bind(this)}>hidde</button>
    </div>;
  }
}
