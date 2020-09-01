import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';

import AddCircleOutlinedIcon from '@material-ui/icons/AddCircleOutlined';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';



export default class LoginOrRegister extends React.Component {

  constructor(props) {
    super(props);
    this.words = {
      zh: {
        login: '登录',
        register: '注册',
        email: '邮箱',
        password: '密码',
        passwordRepeat: '重复密码',
        nickName: '昵称',
        avatar: '选择您的头像'
      },
      en: {
        login: 'Login',
        register: 'Register',
        email: 'Email',
        password: 'Password',
        passwordRepeat: 'Password Repeat',
        nickName: 'Nick Name',
        avatar: 'Select your avatar to upload'
      }
    }
    this.fields = [
      'email',
      'password',
      'passwordRepeat',
      'nickName'
    ]
  }

  submit = async () => {
    const {
      avatar,
      name,
      statement,
      location,
      ext,
      file
    } = this.state;

    if (!avatar) return window.Toast({
      text: '请选择您的头像'
    })
    if (!name) return window.Toast({
      text: '请输入您的昵称'
    })
    if (!location) return window.Toast({
      text: '定位失败，请刷新页面重试'
    })
    
    const avatarUrl = await Uploader.UploadImage({
      url: avatar,
      ext,
      file
    });
    
    const {
      adcode,
      city,
      district
    } = location.addressComponent;
    const {
      lng,
      lat
    } = location.position;
    const res = await muse('muse/update', {}, {
      avatar: avatarUrl,
      name,
      statement,
      adcode,
      city,
      district,
      lng,
      lat
    });
    if (res && res.code === 200) {
      const backTo = window.getQuery('backTo') || `/user/${name}`;
      window.goTo(backTo)
    }
  }

  onSelectAvatar = (e) => {
    if (this.state.avatar) {
      window.URL.revokeObjectURL(this.state.avatar);
    }
    const currentFile = e.target.files[0];
    const url = URL.createObjectURL(currentFile)
    this.setState({
      avatar: url,
      ext: currentFile.name.split('.').pop(),
      file: e.target.files[0]
    })
  }

  checkNameAvailable = window.debounce(async () => {
    if (!this.state.name) {
      this.setState({
        available: false
      });
      return;
    }
    const res = await muse('muse/check', {
      name: this.state.name
    });
    this.setState({
      available: res && res.data === 'ok'
    })
  })

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
    return this.fields.map((el, index) => {
      return <Grid item xs={12} key={el}>
        <FormControl fullWidth>
          <TextField
            variant="outlined"
            required
            fullWidth
            label={getWords(el)}
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
      locationLoading,
      locationShown,
      avatar,
      available
    } = this.state;
    const {
      isZh,
      type
    } = this.props;
    return <div className="login-or-register">
      <Container component="main" maxWidth="xs">
        <Avatar src={avatar || ''}/>
        <Button
          variant="contained"
          color="secondary"
          size="medium"
          icon="upload"
          onClick={this.triggerInput}
        >
          <input type="file" ref="uploader" accept="*" onChange={this.onSelectAvatar}/> 
          <CloudUploadIcon />{getWords('avatar')}
        </Button>
        <Box mt={3}>
          <Grid container spacing={2}>
            {this.getFormInputs()}
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={this.submit}
                size="large"
              >
                {type === 'login' ? this.getWords('login'): this.getWords('reg')}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </div>
      
  }
}