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

        //to prevent google from crawling this like a relative url;
        let wsUrl = '//' + location.host + '/?' + 'redirectTo' + '=jvr&' + 'key=' + (document.cookie.key || '');
        this.socket = io(wsUrl);
        
        let self = this;

        this.socket.on('connect', function() {

            if (location.pathname === '/jvr' && location.search.match(/\?id=(.+)$/)) {
                let code = location.search.replace(/\?id=(.+)$/, '$1');
                console.log(code, '=================')
                setTimeout(function() {
                    self.socket.emit('jvr', {
                        code
                    });
                }, 100);
                
            }
        })
        this.socket.on('message', this.handleMessage.bind(this));
        this.socket.on('init', this.hanldeInit.bind(this));
        this.socket.on('torrent', this.hanldeTorrent.bind(this));
        let blockChat = document.cookie.match('chatPoped');
        if (!blockChat) {
        	this.setState({
        	    booted: true
        	});
        	this.setCookie('chatPoped', '1', 0.3);
        }
        
    }

    handleMessage(data) {

        let _data = this.parseMessage(data);
        this.setState({
            messages: this.state.messages.concat(_data)
        }, this.scrollTo.bind(this));
    }

    parseMessage(data) {
        return data;
    }

    async encodeMessage(message) {
        let { name, messages, avatar } = this.state,
            finalMessage;

        let videoCode = message.match(/\s*\/{2}[0-9a-zA-Z]+[-\s]*[0-9]+\s*/g);

        if (videoCode) {
            let tasks = await axios.get(`/chatSearch?ids=${encodeURIComponent(JSON.stringify(videoCode))}`),
                formattedMessages = message.replace(/\s*\/{2}[0-9a-zA-Z]+[-\s]*[0-9]+\s*/g, '||').split('||'),
                index = 0;

            tasks = tasks.data || [];

            if (formattedMessages.length) {
                finalMessage = [{
                    message: $.trim(formattedMessages.shift()),
                    type: 'text',
                    room: 'Jvr'
                }];

                while (formattedMessages.length) {
                    let video = tasks.shift() || {},
                        formattedMessage = formattedMessages.shift();

                    finalMessage.push({
                        message: video.code + ' ' + video.title,
                        image: video.cover,
                        type: 'Jvr',
                        room: 'Jvr'
                    });
                    finalMessage.push({
                        message: formattedMessage,
                        type: 'text',
                        room: 'Jvr'
                    });
                }
            } else {
                finalMessage = tasks.map(video => {
                    return {
                        message: video.code + ' ' + video.title,
                        image: video.cover,
                        type: 'Jvr',
                        room: 'Jvr'
                    }
                })
            }

            finalMessage = finalMessage.filter(message => message.message).map(message => {
                return {
                    ...message,
                    fromId: this.socket.id,
                    name,
                    avatar
                };
            })

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
        this.setCookie('key', id, 365);

    }

    setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
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
				<i className={`${booted ? '' : 'fa-rotate-180'} fa fa-angle-right`} />
			</div>
			<div ref="messagePanel" className="message-panel">
				{(messages || []).map( (message, i) => {
					return <Message 
						key={i} 
						wrappedMessage={message} 
						wrappedPreMessage={messages[i - 1]}
						myId={this.socket && this.socket.id}
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
			<div className="user-input">
				<input value={input}
					placeholder="Try send //video-code."
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
			</div>
		</div>
    }
}

class Message extends React.PureComponent {
    renderNormal() {
        let { wrappedMessage, wrappedPreMessage = {}, myId } = this.props, { name, message, createdAt, type, image, fromId, avatar } = wrappedMessage,
            showStamp = wrappedPreMessage.loginMessasge || (wrappedPreMessage.createdAt && createdAt && dayjs(createdAt) - dayjs(wrappedPreMessage.createdAt) > 1000 * 300);

        return <div className="message-wrap f c fc">
			{showStamp ? <div className="time-stamp f fc">{window.dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss')}</div> : null}
			<div className={`${ fromId === myId ? 'mine' : ''} message f r`}>
				<div className="avatar f">
					<img src={'https://pics.r18.com/mono/actjpgs/' + avatar} />
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
    render() {
        if (this.props.wrappedMessage.loginMessasge) {
            return this.renderLoginMessage();
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

const isBot = (window.navigator && window.navigator.userAgent || '').match(/(googlebot)/i);
!isBot && ReactDOM.render(<Root/>, document.getElementById('instant-message'))
