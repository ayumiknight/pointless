const javlibraryAutoTask = require('./javlibraryAutoPost');

async function test() {
  let Javlibrary = new javlibraryAutoTask({
    // firefox: true
  });
  await Javlibrary.init();
}

test()