import React from 'react';
import io from 'socket.io-client';
import dayjs from 'dayjs';
import { render } from 'react-dom';
import axios from 'axios';

export default class Chat extends React.Component {
	constructor() {
		super();
		this.state = {
			messages: [],
			inited: false
		};
	}

	componentWillReceiveProps(props) {
		if (props.isLogin && !this.state.inited) {
			this.setState({
				inited: true
			})
			this.init()
		}
	}

	init() {
		//to prevent google from crawling this like a relative url;
		let wsUrl = '//' + location.host + '/?' + 'redirectTo' + '=jvr';
		this.socket = io(wsUrl);
		
		let self = this;

		this.socket.on('connect', function() {
			window.mySocket = self.socket;
		})
		this.socket.on('message', this.handleMessage.bind(this));
		this.socket.on('init', this.hanldeInit.bind(this));
		let blockChat = localStorage.chatPoped;

		if (!blockChat) {
			this.setState({
				booted: true
			});
			localStorage.chatPoped = 1;
		}
	}

	handleMessage(data) {
		this.setState({
			messages: this.state.messages.concat(data)
		}, this.scrollTo.bind(this));
	}

	async encodeMessage(message) {
		let { name, messages, avatar } = this.state,
			finalMessage;

		let videoCode = message.match(/^[0-9a-zA-Z]+[-\s]*[0-9]+$/g);

		if (videoCode) {
			let tasks = await axios.get(`/chatSearch?ids=${encodeURIComponent(JSON.stringify(videoCode))}`);

			tasks = tasks.data || [];

			if (tasks[0]) {
				let video = tasks[0];
				finalMessage = [{
					message: video.code + ' ' + video.title,
					image: video.cover,
					type: 'Jvr',
					room: 'Jvr',
					fromId: this.socket.id,
					name,
					avatar
				}];
			} else {
				finalMessage = [{
					message,
					type: 'text',
					room: 'Jvr',
					fromId: this.socket.id,
					name,
					avatar
				}]
			}

		} else {
			finalMessage = [{
				message,
				type: 'text',
				room: 'Jvr',
				fromId: this.socket.id,
				name,
				avatar
			}]
		}

		return finalMessage;
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
			messages: this.state.messages.concat([{
				name,
				avatar,
				message: `You are logined as ${name}`,
				loginMessasge: true
			}])
		}, this.scrollTo.bind(this))
	}
	async sendMessage() {
		let { input, name, messages, avatar } = this.state;
		if (!input) return;
		this.setState({
			sending: true
		});
		let wrappedEncoded = await this.encodeMessage(input);
		this.socket.emit('message', wrappedEncoded);
		this.setState({
			messages: this.state.messages.concat(wrappedEncoded),
			input: '',
			sending: false
		}, this.scrollTo.bind(this))
	}

	scrollTo() {
		let messagePanel = this.refs && this.refs.messagePanel,
			scrollHeight = messagePanel.scrollHeight,
			height = messagePanel.offsetHeight;

		window.messagePanel = messagePanel;
		height && scrollHeight && (messagePanel.scrollTop = scrollHeight - height - 1);
	}

	listenEnter(e) {
		if (e.key === 'Enter') {
			this.sendMessage();
		}
	}

	emojiGot(emoji) {
		this.setState({
			input: (this.state.input || '') + emoji,
			showEmojiPicker: !this.state.showEmojiPicker
		})
	}

	render() {
		let {
			room,
			messages,
			name,
			input,
			count,
			booted,
			sending,
			showEmojiPicker
		} = this.state;

		return <div className={`${booted ? 'booted' : ''} instant-message`}>
			<div className="room-title">
				JVR Discuss <div className="count">({count} online)</div>
			</div>
			<div className="switch" onClick={() => {
					this.setState({
						booted: !booted
					});
				}}>
				<i className={`far fa-comments`} />
			</div>
			<div ref="messagePanel" className="message-panel">
				{(messages || []).map( (message, i) => {
					return <Message 
						key={i} 
						wrappedMessage={message}
						wrappedPreMessage={messages[i - 1]}
						myId={this.socket && this.socket.id}
						socket={this.socket}
					/>
				})}
			</div>

			{showEmojiPicker ? <EmojiPicker 
				emojiGot={this.emojiGot.bind(this)}
				onClose={() => {
					this.setState({
						showEmojiPicker: !this.state.showEmojiPicker
					});
				}}
			/> : null}
			{ this.props.isLogin ? <div className="user-input">
				<input value={input}
					placeholder=" : ) Try 'IPVR-048'"
					onKeyDown={this.listenEnter.bind(this)}
					onChange={(e) => {
						this.setState({
							input: e.target.value
						});
					}}
				/>
				<button onClick={() => {
					this.setState({
						showEmojiPicker: !this.state.showEmojiPicker
					});
				}}>
					<i className="fas fa-smile"/>
				</button>
				<button onClick={this.sendMessage.bind(this)}>{
					sending ? <i className="fas fa-spinner fa-spin"/>: <i className="fas fa-paper-plane"/>
				}</button>
			</div> : <div className="chat-user-login-button">{this.props.isZh ? '去登录或注册' : 'Login Or Register To Chat'}</div>}
		</div>
	}
}

class Message extends React.PureComponent {
	renderNormal() {
		let { wrappedMessage, wrappedPreMessage = {}, myId } = this.props, { name, message, createdAt, type, image, fromId, avatar } = wrappedMessage,
			showStamp = wrappedPreMessage.loginMessasge || (wrappedPreMessage.createdAt && createdAt && dayjs(createdAt) - dayjs(wrappedPreMessage.createdAt) > 1000 * 300);

		return <div className="message-wrap f c fc">
			{showStamp ? <div className="time-stamp f fc">{dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss')}</div> : null}
			<div className={`${ fromId === myId ? 'mine' : ''} message f r`}>
				<div className="avatar f">
					<img src={avatar} />
				</div>
				<div className="message-content f c">
					<div className="name">{name}</div>
					<div className="content">{type === 'Jvr' ? <div className="jvr">
						<div className="jvr-title">
							{message}
						</div>
						<div className="jvr-img">
							<img src={image} />
						</div>
					</div>
					: message}</div>
				</div>
			</div>
		</div>
	}

	renderLoginMessage() {
		return <div className="message-wrap f c fc">
			<div className="time-stamp f fc">{this.props.wrappedMessage.message}</div>
		</div>
	}

	renderTorrent() {
		let { wrappedMessage, wrappedPreMessage = {}, myId } = this.props, { title, magnet, code, time, createdAt, fromId } = wrappedMessage,
			showStamp = wrappedPreMessage.loginMessasge || (wrappedPreMessage.createdAt && createdAt && dayjs(createdAt) - dayjs(wrappedPreMessage.createdAt) > 1000 * 300);

		let isZh = (location.pathname || '').match(/^\/zh.*$/i);

		return [<div className="message-wrap f c fc">
			{showStamp ? <div className="time-stamp f fc">{dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss')}</div> : null}
			<div className={`${ fromId === myId ? 'mine' : ''} message f r`}>
				<div className="avatar f">
					<img src="/static/favicon.png" />
				</div>
				<div className="message-content f c">
					<div className="name">Professional Drunker</div>
					<div className="content">
						<div className="torrent">
							<div className="torrent-title">
								{isZh ? `我们为您找到了${code}的种子链接.` : `We just found a magnet link of ${code} for you.`}
							</div>
							<div className="torrent-title">
								{title}
							</div>
							<div className="torrent-magnet">
								<a title={title} href={magnet} onClick={this.logClick.bind(this)}>{magnet}</a>
							</div>
							<div className="desc-and-copy">
								{time} old&emsp;                               
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>, <div className="message-wrap f c fc">   
			<div className={`${ fromId === myId ? 'mine' : ''} message f r`}>
				<div className="avatar f">
					<img src="/static/favicon.png" />
				</div>
				<div className="message-content f c">
					<div className="name">Professional Drunker</div>
					<div className="content"> 
						{isZh ? <div className="legal-notice">
							搜索结果由 <a href={`https://torrentz2.eu/search?f=${code}`}>Torrentz2.eu</a> 为您提供
						</div> : <div className="legal-notice">
							We don't host any files, all information is provided by <a href={`https://torrentz2.eu/search?f=${code}`}>Torrentz2.eu</a> 
						</div>}
					</div>
				</div>
			</div>
		</div>];
	}
	render() {
		if (this.props.wrappedMessage.loginMessasge) {
			return this.renderLoginMessage();
		} else if (this.props.wrappedMessage.magnet) {
			return this.renderTorrent();
		} else {
			return this.renderNormal();
		}
	}
}

class EmojiPicker extends React.Component {
	constructor() {
		super();
		this.group = [
			[128513, 128591]
		];
		let allEmojis = [];
		for (var i = 0; i < this.group.length; i++) {
			var range = this.group[i];
			for (var x = range[0]; x < range[1]; x++) {
				allEmojis.push(String.fromCodePoint(x))
			}
		}
		this.allEmojis = allEmojis;

	}
	render() {
		return <div className="emoji-pop">
			<div className="top" onClick={this.props.onClose}>Emoji <i className="fa fa-times"/></div>
			
			<div className="emoji-wrap f r fc">
				{this.allEmojis.map((emoji, i) => {
					return <div onClick={() => {
						this.props.emojiGot(emoji)
					}} className="emoji f fc" key={i}>{emoji}</div>
				})}
			</div>
		</div>
	}
}

