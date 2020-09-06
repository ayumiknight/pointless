import React from 'react';
import Alert from '@material-ui/lab/Alert';
import { withStyles } from '@material-ui/core/styles';

export default class GlobalToast extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      severity: 'warning'
    };
    this.timer = null;
  }
  componentDidMount() {
    window.bus.on('toast', this.onToast)
  }
  componentWillUnmount() {
    window.bus.removeAllListeners('toast')
  }
  onToast = (newState) => {
    const duration = newState.duration || 2;
    if (this.timer) {
      try {
        clearTimeout(this.timer)
      } catch(e) {}
    }
    this.timer = setTimeout(() => {
      this.setState({
        text: ''
      })
    }, duration * 1000)
    this.setState(newState)
  }
  render() {
    const {
      text,
      severity
    } = this.state;
    return <div className="global-alert">
      { text && <Alert severity={severity} variant="filled">
        {text}
      </Alert>}
    </div>
  }
}