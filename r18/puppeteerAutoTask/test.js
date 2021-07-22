const javlibraryAutoTask = require('./javlibraryAutoPost');

async function test() {
  let Javlibrary = new javlibraryAutoTask({
	  headful: true
	  // firefox: true
  });
  await Javlibrary.init();
}

test()
