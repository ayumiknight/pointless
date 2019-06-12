import React from 'react';
import { browserHistory, BrowserRouter, Route, Router, Switch, Redirect} from 'react-router-dom';
import { hot } from 'react-hot-loader';
import { createBrowserHistory } from 'history';

const ReactHistory = createBrowserHistory();
window.ReactHistory = ReactHistory;
ReactHistory.listen((loc) => {
  console.log(loc,' here is loc============')
})
const Root = () => (
  <Router history={ReactHistory} >
    <Switch>
      <Route exact path="/" component={require('../pages/hello.jsx').default} />
      <Redirect form="" to="/" />
    </Switch>
  </Router>
);

export default hot(module)(Root);
