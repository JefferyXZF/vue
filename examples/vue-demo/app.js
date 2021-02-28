

// eslint-disable-next-line no-undef
var app = new Vue({
  // app initial state
  data: {
    num: 0
  },
  watch: {
    num (newVal, oldVal) {
      console.log(`watch 新值：${newVal}, 旧值：${oldVal}`)
    }
  },
  computedNum () {
    return this.num + 1
  }
})

console.log(app.$options)
// mount
// app.$mount('body')
// app.$mount('.todoapp')
