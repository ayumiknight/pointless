const rapidgator = require('./rapidgator')

async function run() {
  const R = new rapidgator();
  await R.login();
  await R.cleanEmptyFolder();
  console.log('done');
}
run()