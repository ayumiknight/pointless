import React from 'react';
require('./banner.less');
export default class Banner extends React.Component {

  render() {
    return <header className="banner">
      <div className="title">Point4</div>
      <div className="sub-title">Explorer the world with wonders</div>
    </header>;
  }
}
