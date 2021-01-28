/**
 * 选项数据
 * 官网地址: https://cn.vuejs.org/v2/api/#data
 * 选项数据
 */

 /**
  * 1、data
  * 实现流程：
  * 1、调用 stateMixin 在 Vue 原型上定义 $data 属性的 get 和 set 方法，源码地址：src\core\instance\index.js
  * 2、调用 _init 进行选项合并（子组件一样），在 mergeOptions 会进行 data 的合并，源码地址：src\core\instance\index.js、src\core\instance\init.js
  * 3、合并策略：子组件 data 必须是一个函数，区分父子组件和实例组件合并。源码地址：src\core\util\options.js
  * 4、父、子组件都存在相同属性，子组件会覆盖父组件的值
  * 5、调用 initData 实现 data 响应式，data 的 key 不能和 props、methods 重复
  * 6、通过 vm.xxx 访问到 data 的属性，不能使用 _ 或 $ 首字母开头，否则代理不了。 源码地址：src\core\instance\state.js
  */

//  var data = { a: 1 }

//  // 直接创建一个实例
//  var vm = new Vue({
//    data: data
//  })
//  vm.a // => 1
//  vm.$data === data // => true

//  // Vue.extend() 中 data 必须是函数
//  var Component = Vue.extend({
//    data: function () {
//      return { a: 1 }
//    }
//  })


 /**
  * 2、props
  * 实现流程：
  * 1、调用 stateMixin 在 Vue 原型上定义 $props 属性的 get 和 set 方法，源码地址：src\core\instance\index.js
  * 2、调用 _init 进行选项合并（子组件一样），在 mergeOptions 会进行 data 的合并，源码地址：src\core\instance\index.js、src\core\instance\init.js
  * 3、合并策略：子覆盖父（比如定义在 extends, mixins)
  * 5、调用 initProps 实现 props 响应式。源码地址：src\core\instance\state.js
  * 实现流程：initProps
  * a. 调用 validateProp 检验 props，并从 propsData 取到 props 的值
  * b. 调用 defineReactive 定义 props 响应式，props 会对默认值的嵌套对象实现响应式，不会对父组件闯过来的嵌套对象做响应式
  * c. props 代理
  */

  // 简单语法
// Vue.component('props-demo-simple', {
//   props: ['size', 'myMessage']
// })


 /**
  * 3、propsData 存储父组件传来的 props 值
  * 在 createComponent 中调用 extractPropsFromVNodeData 得到 propsData 值。源码地址：src\core\vdom\create-component.js
  */


//  var Comp = Vue.extend({
//   props: ['msg'],
//   template: '<div>{{ msg }}</div>'
// })

// var vm = new Comp({
//   propsData: {
//     msg: 'hello'
//   }
// })


 /**
  * 4、computed 计算属性，调用 initComputed
  * 实现流程：
  * a. computed 可以定位为函数或对象，如果是函数赋值为 getter 函数，setter 函数为空函数
  * b. 为 每一个 computed 计算属性实例化一个 Watch(lazy 为 true)，getter 作为 watch 的执行回调函数，computed 属性不能和 data、props 重名
  * c. defineComputed 调用 Object.defineProperty 代理到 vm 上， 定义 get 和 set 方法，访问计算属性，触发 get 方法 调用 computedGetter 函数
  * d. computedGetter 取出当前 computed watch, 进行依赖收集，dirty 为 true ,调用 watcher.evaluate() 取得 watcher.value 值（缓存原理）
  * 源码地址：src\core\instance\state.js
  */




  /**
  * 5、methods 调用 initMethods 将 methods 绑定到 vm 上
  * 实现流程：
  * a. 遍历 methods 对象，取出的值必须是一个函数，不能和 props 重名，不能使用已经定义的VUE函数（_或$开头)
  * b。绑定函数到 vm 上
  * 源码地址：src\core\instance\state.js
  */



  /**
  * 6、watch 调用 initWatch，实例化 user watch
  * 实现流程：
  * a. 遍历 watch，调用 createWatcher，如果里面值是数组，递归处理
  * b. createWatcher 调用 vm.$watch，它是一个 user watch
  * c. $watch 实例化一个 Watcher
  * 源码地址：src\core\instance\state.js
  */
