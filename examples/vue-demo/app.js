debugger

// Vue.component('async-component', {
//   data () {
//     return {
//       msg: '全局组件注册'
//     }
//   },
//   template: '<h1>{{ msg }}</h1>'
// })

// const componentDemo = {
//   template: '<h1>{{ demo }}</h1>',
//   data () {
//     return {
//       demo: '局部组件注册'
//     }
//   }
// }

// eslint-disable-next-line no-undef
// var app = new Vue({
//   // app initial state
//   data: {
//     num: 0
//   },
//   watch: {
//     num (newVal, oldVal) {
//       console.log(`watch 新值：${newVal}, 旧值：${oldVal}`)
//     }
//   },
//   computedNum () {
//     return this.num + 1
//   },
//   components: {
//     componentDemo
//   }
  
// }).$mount('#app')

// mount
// app.$mount('body')
// app.$mount('.todoapp')

new Vue({
  el: '#app',
  template: `
  <h1>
    {{ msg }}
  </h1>
  `,
  data () {
    return {
      msg: 'Hello world'
    }
  }
})