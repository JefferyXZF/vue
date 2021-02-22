/**
 * 全局 API
 * 官网地址: https://cn.vuejs.org/v2/api/#%E5%85%A8%E5%B1%80-API
 * Vue 定义的全局 API 都在该目录下：src\core\global-api
 */

/**
 * 1、Vue.extend 创建 Vue 的子类构造器
 * 实现流程：
 * a. 使用缓存，多次调用 Vue.extend 只返回第一次执行结果
 * b. 检验组件名称（1、组件名称首字符必须是字母，不能是数字或非法字符；2、不能是内置组件或原生标签
 * c. 基于 Vue.prototype 原型继承，选项合并，将 Vue 的属性和方法进行继承
 * d. 返回一个 字类构造器
 * 源码地址：src\core\global-api\extend.js
 * 使用场景：1、全局注册组件；2、局部注册组件；3、创建子组件
 */

// var childComponent = Vue.extend({
//   template: '<h1>Hello world</h1>',
//  })

//  Vue.component('childComponent', {
//   render (h) {
//     return h('h1', 'Hello world')
//   },
//   props: {
//     msg: {
//       type: String
//     }
//   }
//  })


/**
 * 2、nextTick 在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM。
 * 实现流程：
 * a. 将 nextTick 回调函数 push 到 callbacks 数组
 * b. pending 变量维护队列更新，调用 timerFunc 方法，如果回调函数为空，返回一个 promise 对象
 * c. timerFunc 是一个异步队列函数，微任务/宏任务优先级 Promise > MutationObserver > setImmediate > setTimeout
 * d. 将 flushCallbacks 函数放在 异步函数回调中执行
 * 源码地址：src\core\util\next-tick.js
 */


// // DOM 还没有更新
// Vue.nextTick(function () {
//   // DOM 更新了
// })

// // 作为一个 Promise 使用 (2.1.0 起新增，详见接下来的提示)
// Vue.nextTick()
//   .then(function () {
//     // DOM 更新了
//   })


 /**
 * 3、set 向响应式对象中添加一个 property，并确保这个新 property 同样是响应式的，且触发视图更新
 * 实现流程：
 * a. 如果是数组类型，调用数组的 splice 实现，vue 在响应式处理已经对该方法实现了响应式
 * b. 新增的是响应式对象值，直接返回；不能添加到根组件实例下
 * c. 目标源对象不是响应式，直接返回，不做响应式处理
 * d. 调用 defineReactive 新增响应式值，并调用 ob.dep.notify() 派发更新
 * 源码地址：src\core\observer\index.js set 方法
 */

// Vue.set( target, propertyName/index, value )



 /**
 * 4、delete  向响应式对象中添加一个 property，并确保这个新 property 同样是响应式的，且触发视图更新
 * 实现流程：
 * a. 如果是数组类型，调用数组的 splice 实现，vue 已经对该方法实现了响应式
 * b. 目标对象不存在该属性，直接返回
 * c. 调用 delete 删除属性
 * d. 如果目标是一个响应式对象，调用 ob.dep.notify() 派发更新
 * 源码地址：src\core\observer\index.js del 方法
 */

// Vue.delete( target, propertyName/index)



 /**
 * 5、directive 注册全局指令
 * 实现流程：
 * a. 如果传一个参数，返回已注册的指令
 * b. 如果第二个参数是函数，添加函数到 bind 和 update 钩子函数下
 * 源码地址：src\core\global-api\assets.js
 */

//  // 注册 (指令函数)
// Vue.directive('my-directive', function () {
//   // 这里将会被 `bind` 和 `update` 调用
// })

// // getter，返回已注册的指令
// var myDirective = Vue.directive('my-directive')


 /**
 * 6、filter 注册或获取全局过滤器。
 * 源码地址：src\core\global-api\assets.js
 */

 // 注册
// Vue.filter('my-filter', function (value) {
//   // 返回处理后的值
// })


 /**
 * 7、component 注册全局组件。注册或获取全局组件。注册还会自动使用给定的 id 设置组件的名称
 * 实现流程：
 * a. 如果传一个参数，返回已注册的组件
 * b. 开发环境下，检验组件名称
 * b. 如果第二个参数是对象，调用 Vue.extend 实现继承，返回一个 Sub 字类构造器
 * 源码地址：src\core\global-api\assets.js
 */

//  // 注册组件，传入一个扩展过的构造器
// Vue.component('my-component', Vue.extend({ /* ... */ }))

// // 注册组件，传入一个选项对象 (自动调用 Vue.extend)
// Vue.component('my-component', { /* ... */ })

// // 获取注册的组件 (始终返回构造器)
// var MyComponent = Vue.component('my-component')


 /**
 * 8、Vue.use 按照插件， Vue 拓展
 * 实现流程：
 * a. Vue 使用单例模式，_installedPlugins 缓存已经按照过的插件，如果已经安装则直接返回
 * b. 将参数转化为数组，并且将 Vue 插入其中作为第一个参数
 * b. 如果插件提供 install 方法，则调用该方法，否则调用插件函数
 * 源码地址：src\core\global-api\assets.js
 */



/**
 * 9、Vue.mixin 全局混入
 * 实现流程：
 * a. 调用 mergeOptions 进行选项合并
 * b. mergeOptions 处理过程：检验组件、规范 (props、inject、dirctives)、递归处理(extends，mixins)、使用合并策略进行合并
 * c. 合并策略分为：(el, propsData)、data、生命周期钩子、资源（components、directives、filters)、
 * watch、(props, methods, inject, computed)、provide、默认合并策略（有子取子，没子取父）
 * 源码地址：src\core\global-api\mixin.js
 */


 /**
 * 10、compile 编译器，将模板编译得到 render 函数
 * 源码地址：src\platforms\web\entry-runtime-with-compiler.js compileToFunctions 方法
 */


  /**
 * 11、observable 将一个对象变为响应式对象
 * 实现流程：调用 observe 方法，返回一个响应式对象
 * 源码地址：src\core\global-api\index.js observable
 */

   /**
 * 12、Vue-version 提供字符串形式的 Vue 安装版本号。这对社区的插件和组件来说非常有用，你可以根据不同的版本号采取不同的策略
 * 源码地址：src\core\index.js、scripts\config.js
 */
