import React from 'react';
import util from '../util.js';
require('./points-gallery.less');
export default class BasicMap extends React.Component {

  componentDidMount() {
    this.state = {};
  }

  componentDidMount() {

    if (this.props.ready) {

      this.initialize();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.ready && !this.props.ready) {
      this.initialize();
    }
  }

  async initialize() {

    let initLocation = util.locations.commonLocations('newyork');
    var pano = new google.maps.StreetViewPanorama(
      document.getElementById('pano-for-gallery'), {
        position: initLocation,
        pov: {
          heading: 0,
          pitch: 0
        },
        addressControl: false,
        fullscreenControl: false
      });

    this.pano = pano;

  }


  render() {
    return <div className="points-gallery">
      <div id="pano-for-gallery"></div>
    </div>;
  }
}
