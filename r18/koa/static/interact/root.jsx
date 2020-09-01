import React from 'react';
import Chat from './chat';
import LoginRegister from './loginRegister';
import axios from 'axios';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


class Root extends React.Component {
  constructor() {
    super()
    this.state = {
      isLogin: false,
      user: {},
      initialized: false,
      isZh: !!location.pathname.match(/^\/zh.*/i)
    }
  }

  async componentDidMount() {
    await this.getUserInfo()
  }

  async getUserInfo() {
    const res = await axios.get('/api/getUser');
    if (res && res.data) {
      this.setState({
        ...res.data,
        initialized: true
      })
    }
  }

  logout = async () => {
    const res = await axios.get('/api/logout');
    if (res && res.data) {
      this.setState({
        isLogin: false,
        user: {}
      })
    }
  }
  
  login = async () => {
    this.setState({
      showLogin: 'login'
    })
  }

  reg = async () => {
    this.setState({
      showLogin: 'reg'
    })
  }

  handleClose = () => {
    this.setState({
      showLogin: null
    })
  }

  render() {
    const {
      isLogin,
      user = {},
      showLogin,
      isZh
    } = this.state;

    const {
      avatar,
      nick_name
    } = user;

    return <div className="login-or-register">
      { isLogin ? <Box>
        <Avatar src={avatar} />
        <Button variant="outlined" size="medium" color="primary" onClick={this.logout}>
          Logout
        </Button>
      </Box> : <ButtonGroup color="primary" aria-label="outlined primary button group">
        <Button onClick={this.login}>Login</Button>
        <Button onClick={this.reg}>Register</Button>
      </ButtonGroup>}
      <Dialog
        open={showLogin}
        onClose={this.handleClose}
      >
        <DialogTitle>
          {isZh ? (showLogin === 'reg' ? '用户注册' : '用户登录') : (showLogin === 'reg' ? 'Register' : 'Login')}
        </DialogTitle>
        <DialogContent>
          <LoginRegister
            isZh={isZh}
            type={showLogin}
          />
        </DialogContent>
      </Dialog>
    </div>
  }
}
const isBot = (window.navigator && window.navigator.userAgent || '').match(/(googlebot)/i);
!isBot && render(<Root/>, document.getElementById('instant-message'))
