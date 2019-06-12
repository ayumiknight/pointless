import React from 'react';
import BasicMap from '../components/basic-map.jsx';
require('../style/hello.less');
export default class Hello extends React.Component {

  componentDidMount() {

  }

  render() {
    return <div className="hello">
    	<BasicMap />
    </div>;
  }
}
