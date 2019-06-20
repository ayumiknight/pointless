import React from 'react';
import { browserHistory, BrowserRouter, Route, Router, Switch, Redirect} from 'react-router-dom';
import { hot } from 'react-hot-loader';
import { createBrowserHistory } from 'history';
import Index from '../pages/hello.jsx';
const ReactHistory = createBrowserHistory();
window.ReactHistory = ReactHistory;
ReactHistory.listen((loc) => {
  console.log(loc,' here is loc============')
});
const Root = () => (
 
  	<Index>
  		<Router history={ReactHistory} >
	  		<Switch>
	  		  <Route exact path="/" component={require('../pages/gallery-page.jsx').default} />
	  		  <Route path="/explorer" component={require('../pages/explore-page.jsx').default} />
	  		  <Redirect form="" to="/" />
	  		</Switch>
  		</Router>
  	</Index>
   
  
);

export default hot(module)(Root);
