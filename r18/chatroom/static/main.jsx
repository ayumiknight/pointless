var { Component } = React;

class Root extends Component {
	render() {
		return 'hello world';
	}
}
ReactDOM.render(<Root/>, document.getElementById('root'))
