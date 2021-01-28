
// app Vue instance

var app = new Vue({
  // app initial state
  data: {
    newTodo: 0
  },
  computed: {
    number: {
      get () {
        return this.newTodo + 1
      },
      set (val) {
        console.log(val)
      }
    }
  },
  methods: {
    refresh (e) {
      ++this.newTodo
    },
    setComputed () {
      console.log('computed')
      this.number = 2222
    }
  },
})

// mount
app.$mount('.todoapp')
