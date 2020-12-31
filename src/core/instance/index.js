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
  this._init(options)
}

initMixin(Vue) // 混入 _init 方法
stateMixin(Vue) // 混入 VUE 实例属性 $data, $props, $set, $delete, $watch
eventsMixin(Vue) // 混入 $on, $once, $off, $emit 方法
lifecycleMixin(Vue) // 混入 _update, $forceUpdate, $destroy 方法
renderMixin(Vue) // 安装运行时辅助工具，混入 $nextTick, _render 方法

export default Vue
