import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';

import AddCircleOutlinedIcon from '@material-ui/icons/AddCircleOutlined';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

import axios from 'axios';

export default class LoginOrRegister extends React.Component {

  constructor(props) {
    super(props);
    this.words = {
      zh: {
        login: '登录',
        register: '注册',
        edit: '保存',
        key: '邮箱',
        keyError: '请检查您的邮箱',
        secret: '密码',
        secretRepeat: '重复密码',
        noSecret: '请输入您的密码',
        noIdentical: '密码不一致',
        nickName: '昵称',
        noNickName: '请输入您的昵称',
        avatar: '选择您的头像',
        noAvatar: '请选择您的头像'
      },
      en: {
        login: 'Login',
        register: 'Register',
        edit: 'Save',
        key: 'Email',
        keyError: 'Please check your email',
        secret: 'Password',
        secretRepeat: 'Password Repeat',
        noSecret: 'Please enter your password',
        noIdentical: 'Two passwords are not identical',
        nickName: 'Nick Name',
        noNickName: 'Please enter your nick name',
        avatar: 'Upload your avatar',
        noAvatar: 'Please Select your avatar'
      }
    }
    this.regFields = [
      'key',
      'secret',
      'secretRepeat',
      'nickName'
    ]
    this.loginFields = [
      'key',
      'secret'
    ]
    this.editFields = [
      'nickName'
    ]
    const {
      nick_name,
      avatar
    } = this.props.user || {}
    this.state = {
      nickName: nick_name || '',
      avatar: avatar || '',
      key: '',
      secret: '',
      secretRepeat: ''
    }
    this.isLoading = false
  }

  register = async () => {
    
    const {
      key,
      secret,
      secretRepeat,
      nickName,
      file
    } = this.state;
    if (!key || !/^[a-zA-Z0-9_.]+@[a-zA-Z0-9_.]+(\.[a-zA-Z]{2,5}){1,2}$/.test(key)) return window.Toast({
      text: this.getWords('keyError'),
      severity: 'error'
    })
    if (!secret || !secretRepeat) return window.Toast({
      text: this.getWords('noSecret'),
      severity: 'error'
    })
    if (secret !== secretRepeat) return window.Toast({
      text: this.getWords('noIdentical'),
      severity: 'error'
    })
    if (!nickName) return window.Toast({
      text: this.getWords('noNickName'),
      severity: 'error'
    })
    if (!file) return window.Toast({
      text: this.getWords('noAvatar'),
      severity: 'error'
    })
    const form = new FormData();
    form.append('key', key);
    form.append('secret', secret);
    form.append('nick_name', nickName);
    form.append('avatar', file)

    if (this.isLoading) return
    this.isLoading = true
    const res = await axios({
      method: 'post',
      url: '/api/register',
      data: form,
      headers: {'Content-Type': 'multipart/form-data' }
    });
    if (res.data && res.data.status == 200) {
      window.Toast({
        text: res.data.data,
        severity: 'success'
      })
      this.props.onClose()
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
    if (this.isLoading) return
    this.isLoading = true
    const {
      key,
      secret
    } = this.state;
    if (!key || !/^[a-zA-Z0-9_.]+@[a-zA-Z0-9_.]+(\.[a-zA-Z]{2,5}){1,2}$/.test(key)) return window.Toast({
      text: this.getWords('keyError')
    })
    if (!secret) return window.Toast({
      text: this.getWords('noSecret')
    })
    const form = new FormData();
    form.append('key', key);
    form.append('secret', secret);
    const res = await axios({
      method: 'post',
      url: '/api/login',
      data: form,
      headers: {'Content-Type': 'multipart/form-data' }
    });
    if (res.data && res.data.status == 200) {
      window.Toast({
        text: res.data.data,
        severity: 'success'
      })
      this.props.onClose()
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

  onSelectAvatar = (e) => {
    if (this.state.avatar) {
      window.URL.revokeObjectURL(this.state.avatar);
    }
    const currentFile = e.target.files[0];
    const url = URL.createObjectURL(currentFile)
    this.setState({
      avatar: url,
      file: e.target.files[0]
    })
  }

  triggerInput = () => {
    this.refs.uploader.click();
  }

  getWords = (field) => {
    const {
      isZh
    } = this.props;
    return this.words[isZh ? 'zh' : 'en'][field]
  }

  getFormInputs = () => {


    return (this[this.props.type + 'Fields'] || []).map((el, index) => {
      return <Grid item xs={12} key={el}>
        <FormControl fullWidth>
          <TextField
            variant="outlined"
            required
            fullWidth
            label={this.getWords(el)}
            value={this.state[el]}
            onChange={(e) => {
              this.setState({
                [el]: e.target.value
              })
            }}
            autoFocus={!index}
          />
        </FormControl>
      </Grid>
    })
  }

  render() {
    const {
      isZh,
      type,
      user
    } = this.props;
    const {
      avatar
    } = this.state;

    return <React.Fragment>
      <DialogContent>
        <div className="login-or-register-modal">
          <Container component="main" maxWidth="xs">
          {type === 'reg' || type === 'edit' ? <React.Fragment>
            <Avatar src={avatar}/>
            <Button
              variant="contained"
              color="secondary"
              size="medium"
              icon="upload"
              onClick={this.triggerInput}
            >
              <input type="file" ref="uploader" accept="image/*" onChange={this.onSelectAvatar}/> 
              <CloudUploadIcon />&emsp;{this.getWords('avatar')}
            </Button>
            </React.Fragment> : null}
            <Box mt={3}>
              <Grid container spacing={2}>
                {this.getFormInputs()}
              </Grid>
            </Box>
          </Container>
        </div>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={this.props.onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={type === 'login' ? this.login : this.register} color="primary">
          {type === 'login' ? this.getWords('login'): this.getWords('register')}
        </Button>
      </DialogActions>
    </React.Fragment>
      
  }
}