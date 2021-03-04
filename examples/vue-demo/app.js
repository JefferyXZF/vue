

debugger
var app = new Vue({
  template: `
  <div>
    <!-- <h1> {{hello}}</h1> -->
    <h1> 计算：{{num}}</h1>
    <button @click="changeNum" id="changeNum">num * 2</button>
    <h1>自动计算结果： {{computedNum}}</h1>
    </div>
    `,
  data: {
    num: 1,
  },
  computed: {
    computedNum () {
      return this.num * 2
    }
  },
  // watch: {
  //   num (newVal, oldVal) {
  //     console.log('watch: ', newVal, oldVal)
  //   }
  // },
  methods: {
    changeNum () {
      this.num++
    }
  }
  })

app.$mount('#app')
