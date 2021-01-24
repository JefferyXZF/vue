
// app Vue instance

var app = new Vue({
  // app initial state
  data: {
    newTodo: '',
    editedTodo: null,
    visibility: 'all'
  },
  props: {
    msg: {
      type: String
    }
  },
  methods: {
    refresh (e) {
      console.error(e, '2--------------------------------')
      this.$forceUpdate()
    }
  },
})

// mount
app.$mount('.todoapp')
