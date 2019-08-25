var { Component } = React;

class Root extends Component {
	constructor() {
		super();
		this.state = {

		};
	}

	componentDidMount() {
		this.setState({
			room: 'jvr'
		});
		this.socket = io(`http://localhost:8080/?redirectTo=jvr&key=${document.cookie.key || ''}`);
		this.socket.on('messages', this.handleMessage.bind(this))
		this.socket.on('init', this.hanldeInit.bind(this))
		console.log(this.socket,'=====')
	}

	handleMessage(data) {
		if (data.match) {

		}
	}

	hanldeInit(data) {
		console.log(data,'==========')
		let {
			name,
			count 
		} = data,
			id = this.socket.id;

		this.setState({
			name,
			count
		})
		this.setCookie('key', id, 365);
		
	}

	setCookie(cname, cvalue, exdays) {
	  var d = new Date();
	  d.setTime(d.getTime() + (exdays*24*60*60*1000));
	  var expires = "expires="+ d.toUTCString();
	  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
	}

	sendMessage() {
		let { input } = this.state;
		this.socket.emit('message', encodeURIComponent(input));
	}

	render() {
		let {
			room, 
			messages, 
			name,
			input,
			count
		} = this.state;

		return <div className="instant-message">
			<div className="room-title">
				{room}{name} {count}
			</div>
			<div className="message-panel">
				{(messages || []).map( (message, i) => {
					return <Message key={i} message={message} />
				})}
			</div>
			<div className="user-input">
				<input value={input} onChange={(e) => {
					this.setState({
						input: e.target.value
					});
				}}/>
				<button onClick={this.sendMessage.bind(this)}>Send</button>
			</div>
		</div>
	}
}

class Message extends React.Component {
	render() {
		let { message = {}} = this.props;
		return <div className="message">
		</div>
	}
}
ReactDOM.render(<Root/>, document.getElementById('root'))
