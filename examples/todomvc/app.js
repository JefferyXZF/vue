
// app Vue instance
var app = new Vue({
  // app initial state
  data: {
    newTodo: '',
    editedTodo: null,
    visibility: 'all'
  },
})

// mount
app.$mount('.todoapp')
