import React from 'react';
import ReactDOM from 'react-dom';
import Root from './router';

console.log('before render====================')
ReactDOM.render(<Root />, document.getElementById('app'));
console.log('after render====================')
