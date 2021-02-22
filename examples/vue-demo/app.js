


var app = new Vue({
  // app initial state
  data: {
    newTodo: 0,
  },
  methods: {
    change () {
      this.newTodo++
    }
  },
  
})

console.log(app.$options)
// mount
app.$mount('.todoapp')
