/**
 * 全局配置：Vue.config 是一个对象，包含 Vue 的全局配置。可以在启动应用之前修改下列 property
 * 官网 API 地址：https://cn.vuejs.org/v2/api/
*/



/**
 * 1、silent 取消 Vue 所有的日志与警告
 * 源码地址：src\core\util\debug.js warn方法
 */

// Vue.config.silent = true

/**
 * 2、optionMergeStrategies 自定义合并策略的选项，用于 Vue 全局属性和方法扩展
 * @param {*} parent 父实例
 * @param {*} child 子实例
 * @param {*} vm Vue 实例上下文
 * 源码地址：src\core\util\options.js mergeOptions 选项合并策略方法
 */

// Vue.config.optionMergeStrategies._my_option = function (parentVal, childVal, vm) {
//   if (!parentVal) return childVal + 1
//   return parentVal + childVal + 2
// }

// var Profile = Vue.extend({
//   _my_option: 1
// })

// var ChildProfile = Profile.extend({
//   _my_option: 2
// })

// console.log(Profile.options._my_option) // 2
// console.log(ChildProfile.options._my_option) // 6


/**
 * 3、devtools 开启开发者工具
 * 源码地址：src\platforms\web\runtime\index.js
 */

// Vue.config.devtools = true


/**
 * 4、 errorHandler 错误捕获 可以用于异常日志的收集
 * 源码地址：src\core\util\error.js globalHandleError 方法
 */

// Vue.config.errorHandler = function (err, vm, info) {
//   // handle error
//   // `info` 是 Vue 特定的错误信息，比如错误所在的生命周期钩子
//   // 只在 2.2.0+ 可用
//   console.log(err, vm, info)
// }

/**
 * 5、warnHandler 警告自定义处理函数, 只会在开发者环境下生效
 * 源码地址：src\core\util\debug.js warn 方法
 */

// Vue.config.warnHandler = function (msg, vm, trace) {
//   // `trace` 是组件的继承关系追踪
//   console.error('warnnddddd', msg, vm, trace)
// }


/**
 * 6、ignoredElements 忽略在 Vue 之外的自定义元素 (e.g. 使用了 Web Components APIs)。否则，它会假设你忘记注册全局组件或者拼错了组件名称，从而抛出一个关于 Unknown custom element 的警告。
 * 源码地址：src\core\vdom\patch.js  isUnknownElement 方法
 */

// Vue.config.ignoredElements = [
//   'my-custom-web-component',
//   'another-web-component',
//   // 用一个 `RegExp` 忽略所有“ion-”开头的元素
//   // 仅在 2.5+ 支持
//   /^ion-/
// ]


/**
 * 7、keyCodes
 * 源码地址：src\core\instance\render-helpers\check-keycodes.js  checkKeyCodes 方法
 * 开发环境 proxy 代理检查源码地址：src\core\instance\proxy.js config.keyCodes
 */

// Vue.config.keyCodes = {
//   v: 86,
//   f1: 112,
//   // camelCase 不可用
//   mediaPlayPause: 179,
//   // 取而代之的是 kebab-case 且用双引号括起来
//   "media-play-pause": 13,
//   up: [38, 87]
// }


/**
 * 8、performance 设置为 true 以在浏览器开发工具的性能/时间线面板中启用对组件初始化、编译、渲染和打补丁的性能追踪。只适用于开发模式和支持 performance.mark API 的浏览器上
 * 源码地址：src\core\util\perf.js
 */

// Vue.config.performance = true


/**
 * 9、config.productionTip 设置为 false 以阻止 vue 在启动时生成生产提示
 * 源码地址：src\platforms\web\runtime\index.js
 */

// Vue.config.productionTip = false
