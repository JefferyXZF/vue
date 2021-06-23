/* @flow */

import config from '../config'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
import { ASSET_TYPES } from 'shared/constants'
import builtInComponents from '../components/index'
import { observe } from 'core/observer/index'

import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index'

/**
* 初始化 Vue 的众多全局 API，比如：
 *   默认配置：Vue.config
 *   工具方法：Vue.util.xx
 *   Vue.set、Vue.delete、Vue.nextTick、Vue.observable
 *   Vue.options.components、Vue.options.directives、Vue.options.filters、Vue.options._base
 *   Vue.use、Vue.extend、Vue.mixin、Vue.component、Vue.directive、Vue.filter
 * @author jeffery
 * @date 2021-01-09
 * @export
 * @param {GlobalAPI} Vue
 */
export function initGlobalAPI (Vue: GlobalAPI) {
  // config
  const configDef = {}
  // config 默认配置
  configDef.get = () => config

  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  // 使用代理，挂载 config 属性，get 方法定义了默认的配置
  Object.defineProperty(Vue, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  // 工具方法
  Vue.util = {
    // 警告日志
    warn,
    extend,
    // 合并选项

    mergeOptions,
    defineReactive
  }

  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  // 2.6 explicit observable API
  Vue.observable = <T>(obj: T): T => {
    observe(obj)
    return obj
  }

  Vue.options = Object.create(null)
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue

    // 在 Vue.options.components 中添加内置组件，比如 keep-alive
  extend(Vue.options.components, builtInComponents)

  initUse(Vue) // 挂载 use 静态方法
  initMixin(Vue) // 挂载 mixin 静态方法，mergeOptions 方法合并 options
  initExtend(Vue) // 挂载 extend 静态方法
  initAssetRegisters(Vue) // 挂载 component, directive, filter 静态方法
}
