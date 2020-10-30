const axios = require('axios');
const formData = require('form-data');
const http = require('http');

async function test () {

  const R = await axios.get('https://rapidgator.net/api/v2/user/login?login=664826945@qq.com&password=1414914!fdySG');
  const token = R.data.response.token;
  const upload = await axios.get(`https://rapidgator.net/api/v2/file/upload?token=${token}&name=bg3.jpg&hash=9509195bf907fb257eeb0c050ebed6b5&size=213330`)
  console.log(upload.data, '=======upload, ======')
  return
  const form = new formData()

  axios({
    url:'http://localhost:8080/bg3.jpg',
    method: 'get',
    responseType: 'stream'
  }).then( res => {
    console.log('got response ============', res.headers)
    form.append('file', res.data, {
      knownLength: 213330
    });
    form.submit(upload.data.response.upload.url, function(err, res) {
      if (err) throw err;
      console.log(res.headers, res.statusCode, 'head======')
      var body = '';
      res.on('data', function(chunk) {
        body += chunk;
      });
      res.on('end', function() {
        console.log(body, 'this is response body');
      });
    });
  })
}

test()