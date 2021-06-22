const test = {
  template: `<div>
    <div>父：{{msg}}</div>
    <div>{{test}}</div>
    <button @click="changeMsg">child button</button>
    </div>`,
  data () {
      return {
          test: 'hello world'
      }
  },
  props: {
    msg: String
  },
  methods: {
    changeMsg () {
      this.$emit('change', this.test += 22)
    }
  },
}

export default test