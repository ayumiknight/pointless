var { Component } = React;

class Root extends Component {
	constructor() {
		super();
		this.state = {
			messages: []
		};
	}

	componentDidMount() {
		this.setState({
			room: 'jvr'
		});
		this.socket = io(`http://localhost:8080/?redirectTo=jvr&key=${document.cookie.key || ''}`);
		this.socket.on('message', this.handleMessage.bind(this));
		this.socket.on('init', this.hanldeInit.bind(this));
	}

	handleMessage(data) {
		this.setState({
			messages: this.state.messages.concat(data)
		});
	}

	hanldeInit(data) {
		let {
			name,
			count,
			avatar
		} = data,
			id = this.socket.id;

		this.setState({
			name,
			count,
			avatar,
			messages: [{
				name,
				avatar,
				message: `You are logined as ${name}`,
				loginMessasge: true
			}],
			
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
		let { input, name, messages, avatar } = this.state,
			wrapped = {
				name,
				avatar,
				message: input,
				fromId: this.socket.id
			};

		this.socket.emit('message', wrapped);
		this.setState({
			messages: this.state.messages.concat(wrapped)
		})
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
				Discuss <div className="count">({count} online)</div>
			</div>
			<div className="message-panel">
				{(messages || []).map( (message, i) => {
					return <Message 
						key={i} 
						wrappedMessage={message} 
						wrappedPreMessage={messages[i - 1]}
						myId={this.socket && this.socket.id}
					/>
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

class Message extends React.PureComponent {
	renderNormal() {
		let { wrappedMessage, wrappedPreMessage = {}, myId} = this.props,
			{ name, message, stamp, fromId, avatar } = wrappedMessage,
			showStamp = wrappedPreMessage.stamp && stamp && stamp - wrappedPreMessage.stamp > 1000 * 5;

		return <div className="message-wrap f c fc">
			{showStamp ? <div className="time-stamp f fc">{window.dayjs(stamp).format('YYYY-MM-DD HH:mm:ss')}</div> : null}
			<div className={`${ fromId === myId ? 'mine' : ''} message f r`}>
				<div className="avatar f">
					<img src={'https://pics.r18.com/mono/actjpgs/' + avatar} />
				</div>
				<div className="message-content f c">
					<div className="name">{name}</div>
					<div className="content">{message}</div>
				</div>
			</div>
		</div>
	}
	renderLoginMessage() {
		return <div className="message-wrap f c fc">
			<div className="time-stamp f fc">{this.props.wrappedMessage.message}, use&emsp;\\video-code&emsp;to send snapshots.</div>
		</div>
	}
	render() {
		if (this.props.wrappedMessage.loginMessasge) {
			return this.renderLoginMessage();
		} else {
			return this.renderNormal();
		}
	}
}
ReactDOM.render(<Root/>, document.getElementById('root'))
