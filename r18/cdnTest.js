const axios = require('axios')
const pics = [
  '/ade521a186a748d69590f8afb7f17554.jpg', // 80kb
  '/25c5621304024bb2947dd93b7a92a8d7.jpg' // 756kb
]
const domain = [
  'https://one-app-production-1256532032.picbj.myqcloud.com',
  'https://one-app-production-1256532032.image.myqcloud.com'
]

async function singleTest(url) {
  const start = new Date()
  await axios.get(url)
  const end = new Date()
  return end * 1 - start * 1
}

async function multiTimeTest(domain, pic) {
  const target = domain + pic
  const results = []
  let index = 0
  while (index < 10) {
    const time = await singleTest(target)
    results.push(time)
    index++
  }
  const avg = Math.round(results.reduce((a, b) => a + b) / (index + 1))
  return {
    results,
    avg
  }
}

async function testAll() {
  const res1 = await multiTimeTest(domain[0], pics[0])
  console.log('图片A 80kb')
  console.log(res1.results.join(' '), ' avg ', res1.avg, '\n')

  const res2 = await multiTimeTest(domain[0], pics[1])
  console.log('图片B 756kb')
  console.log(res2.results.join(' '), ' avg ', res2.avg, '\n')

  const res3 = await multiTimeTest(domain[1], pics[0])
  console.log('图片A 80kb CDN')
  console.log(res3.results.join(' '), ' avg ', res3.avg, '\n')

  const res4 = await multiTimeTest(domain[1], pics[1])
  console.log('图片A 756kb CDN')
  console.log(res4.results.join(' '), ' avg ', res4.avg, '\n')
}

testAll()
