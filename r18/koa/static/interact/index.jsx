import React from 'react';
import Chat from './chat';
import LoginRegister from './loginRegister';
import GlobalToast from './GlobalToast';
import axios from 'axios';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Dialog from '@material-ui/core/Dialog';

import DialogTitle from '@material-ui/core/DialogTitle';
import nanobus from 'nanobus'
import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import { render } from 'react-dom';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
require('./index.less')

window.bus = nanobus();
window.Toast = (params) => {
  window.bus.emit('toast', params)
}

class Root extends React.Component {
  constructor() {
    super()
    this.state = {
      isLogin: false,
      user: {},
      isZh: !!window.location.pathname.match(/^\/zh.*/i),
      loaded: false,
      sub: false,
      isSubscribing: false
    }
    this.isLoading = false
  }

  async componentDidMount() {
    this.getUserInfo()
    this.getSubStatus()
    window.unSubscribe = this.unSubscribe
    window.subscribe = this.subscribe
  }

  async getUserInfo() {
    const res = await axios.get('/api/getUser');
    if (res.data.status === 200) {
      this.setState({
        ...res.data.data,
        isLogin: !!(res.data.data && res.data.data.user_id)
      })
    }
  }

  logout = async () => {
    if (this.isLoading) return
    this.isLoading = true
    const form = new FormData();
    const res = await axios({
      method: 'post',
      url: '/api/logout',
      data: form,
      headers: {'Content-Type': 'multipart/form-data' }
    });
    if (res.data.status == 200) {
      window.Toast({
        text: res.data.data,
        severity: 'success'
      })
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } else {
      window.Toast({
        text: res.data.message,
        severity: 'error'
      })
    }
    this.isLoading = false
  }
  
  login = async () => {
    this.setState({
      showLogin: true,
      modalType: 'login'
    })
  }

  reg = async () => {
    this.setState({
      showLogin: true,
      modalType: 'reg'
    })
  }
  edit = async () => {
    this.setState({
      showLogin: true,
      modalType: 'edit'
    })
  }

  handleClose = () => {
    this.setState({
      showLogin: false
    })
  }

  getDialogTitle = (type) => {
    const map = {
      zh: {
        reg: '用户注册',
        login: '用户登录',
        edit: '我的信息'
      },
      en: {
        reg: 'Register',
        login: 'Login',
        edit: 'My'
      }
    }
    return map[this.state.isZh ? 'zh' : 'en'][type]
  }

  getSubStatus = async () => {
    const self = this;
    if (!window.Notification) return;
    navigator.serviceWorker.register('/service.js');
    navigator.serviceWorker.ready.then(function(registration) {
      console.log('register ready---------------')
      return registration.pushManager.getSubscription();
    }).then(subscription => {
      console.log('has subscribetion ', !!subscription)
      if (!subscription) {
        self.setState({
          loaded: true,
          sub: false
        }, self.silentSub.bind(self))
      } else {

        axios({
          method: 'post',
          url: '/api/notificationCheck',
          data: JSON.stringify({
            subscription: subscription
          }),
          headers: {'Content-Type': 'application/json' }
        }).then(res => {
          self.setState({
            loaded: true,
            sub: res.data.status === 200
          })
          if (res.data.status !== 200) {
            self.silentSub();
          }
        }).catch(e => {
          self.setState({
            loaded: true,
            sub: false
          }, self.silentSub.bind(self))
        })
      }
    })
  }

  silentSub = async () => {
    Notification.requestPermission().then(permission => {
      if (permission !== 'denied') {
        this.subscribe()
      }
    })
  }
  
  toggle = async () => {
    const {
      loaded,
      sub
    } = this.state;
    if (!loaded) return
    if (sub) {
      this.unSubscribe()
    } else {
      this.subscribe()
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  subscribe = async () => {
    if (this.state.isSubscribing) return
    this.setState({
      isSubscribing: true
    })
    const self = this;
    const {
      isZh
    } = this.state;
    await new Promise((resolve, reject) => {
      navigator.serviceWorker.ready
      .then(async function(registration) {
        const response = await fetch('/api/notificationKey');
        const vapidPublicKey = await response.text();
        const convertedVapidKey = self.urlBase64ToUint8Array(vapidPublicKey);
        return registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });
      }).then(function(subscription) {
        return axios({
          method: 'post',
          url: '/api/notificationReg',
          data: JSON.stringify({
            subscription: subscription
          }),
          headers: {'Content-Type': 'application/json' }
        }).then( async res => {
          if (res.data.status === 200) {
            window.Toast({
              text: isZh ? '订阅成功' : 'Subscribe Success',
              severity: 'success'
            })
            self.setState({
              sub: true
            })
          } else {
            window.Toast({
              text: isZh ? '订阅失败' : 'Subscribe Failed',
              severity: 'error'
            })
          }
          resolve()
        }).catch(e => {
          console.log(e, 'message===========')
          resolve()
        })
      })
    })
    this.setState({
      isSubscribing: false
    })
  }

  unSubscribe = async () => {
    if (this.state.isSubscribing) return
    this.setState({
      isSubscribing: true
    })
    const self = this;
    const {
      isZh
    } = this.state;

    await new Promise((resolve, reject) => {
      navigator.serviceWorker.ready
      .then(function(registration) {
        return registration.pushManager.getSubscription();
      }).then(function(subscription) {
        return subscription.unsubscribe()
        .then(function() {
          console.log('Unsubscribed', subscription.endpoint);
          return axios({
            method: 'post',
            url: '/api/notificationUnReg',
            data: JSON.stringify({
              subscription: subscription
            }),
            headers: {'Content-Type': 'application/json' }
          })
        });
      }).then(res => {
        if (res.data.status === 200) {
          window.Toast({
            text: isZh ? '取消订阅成功' : 'UnSubscribe Success',
            severity: 'success'
          })
          self.setState({
            sub: false
          })
        } else {
          window.Toast({
            text: isZh ? '取消订阅失败' : 'UnSubscribe Failed',
            severity: 'error'
          })
        }
        resolve()
      }).catch(e => {
        resolve()
      })
    })
    
    this.setState({
      isSubscribing: false
    })
  }


  render() {
    const {
      isLogin,
      user = {},
      showLogin,
      modalType,
      isZh,
      avatar,
      nick_name,
      sub,
      isSubscribing
    } = this.state;

    const screenWidth =  Math.max(document.body.offsetWidth, document.documentElement.offsetWidth);
    const supportPush = !!window.PushManager;
    return <div className="login-or-register-root">
      
      { isLogin ? <div className="logined">
        <Avatar src={avatar} />
        <ButtonGroup  size="small" color="primary">
          <Button onClick={this.logout}>Logout</Button>
          {/* <Button onClick={this.edit}>My</Button> */}
          {supportPush && <Button startIcon={isSubscribing ? <HourglassEmptyIcon/> : null } onClick={this.toggle}>{!isZh ? (sub ? 'UnSubscribe' : 'Subscribe'): (sub ? '取消订阅': '订阅')}</Button>}
        </ButtonGroup>
      </div> : <ButtonGroup size="small" color="primary">
        <Button onClick={this.login}>Login</Button>
        <Button onClick={this.reg}>Register</Button>
        {supportPush && <Button startIcon={isSubscribing ? <HourglassEmptyIcon/> : null } onClick={this.toggle}>{!isZh ? (sub ? 'UnSubscribe' : 'Subscribe'): (sub ? '取消订阅': '订阅')}</Button>}
      </ButtonGroup>}
      <Dialog
        open={!!showLogin}
        onClose={this.handleClose}
        fullScreen={screenWidth <= 480}
      >
        <DialogTitle>
          {this.getDialogTitle(modalType)}
        </DialogTitle>
        <LoginRegister
          isZh={isZh}
          user={this.state}
          type={modalType}
          onClose={this.handleClose}
        />
      </Dialog>
      <GlobalToast/>
      <Chat
        isLogin={isLogin}
        isZh={isZh}
      />
    </div>
  }
}
const isBot = (window.navigator && window.navigator.userAgent || '').match(/(googlebot)/i);
!isBot && render(<Root/>, document.getElementById('login'))
