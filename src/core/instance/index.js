import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

/**
 * @description 定义 Vue 构造函数，通过 new 实例化调用
 * @author jeffery
 * @date 2020-12-31
 * @param {*} options
 */
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // 调用 Vue.prototype._init 方法，该方法是在 initMixin 中定义的
  this._init(options)
}

// 往 Vue 原型上添加属性和方法
initMixin(Vue) // 原型上添加 _init 方法
stateMixin(Vue) // 原型上添加 VUE 实例属性方法 $data, $props, $set, $delete, $watch
eventsMixin(Vue) // 原型上添加 $on, $once, $off, $emit 方法
lifecycleMixin(Vue) // 原型上添加 _update, $forceUpdate, $destroy 方法
renderMixin(Vue) // 安装运行时辅助工具，原型上添加 $nextTick, _render 方法

export default Vue
