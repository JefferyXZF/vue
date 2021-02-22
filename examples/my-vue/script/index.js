
const path = require('path')

const resolve = pathName => {
  return path.resolve(__dirname, '../', pathName)
}
function genConfig () {

  const config = {
    input: resolve('./index.js'), // 打包入口
    output: { // 打包输出文件名
      file: resolve('./dist/my-vue.js'),
      format: 'umd',
    }
  }

  return config
}

module.exports = genConfig()
