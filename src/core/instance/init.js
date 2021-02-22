/* @flow */

import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

let uid = 0

export function  initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    vm._uid = uid++

    let startTag, endTag
    /* istanbul ignore if */
    // 性能埋点
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag) // 性能标识
    }

    // 根实例，也是响应式判断处理的一个标识 a flag to avoid this being observed
    vm._isVue = true
    // 子组件选项合并 merge options，初始化 $options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options)
    } else {
      // 选项合并，将合并后的选项赋值给实例的$options属性
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor), // 返回 Vue 构造函数自身的配置项
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    // 如果支持 proxy, 代理到 _renderProxy。使用场景：在 render 函数会用到，会进行数据的检测，如果数据没有定义在 vm 上，会报错提示
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    // 建立父子组件和根组件联系。初始化 $parent, $root, $children, $refs
    initLifecycle(vm)
    // 处理父组件自定义事件 @xxx，将它注册在子组件 $on 上
    initEvents(vm)
    // 初始化 $slots, $scopedSlots, _c, $createElement, $attrs,  $listeners
    initRender(vm)
    // 执行 beforeCreate 生命周期钩子函数
    callHook(vm, 'beforeCreate')
    // 在data/props之前，初始化 inject，并设置其值为响应式
    // provide 如果传递的是响应式值，那么 inject 值也是响应式，inject 会对它的外层做响应式处理
    initInjections(vm) // resolve injections before data/props
    // 构建响应式系统, 初始化 props, methods, data, computed, watch
    initState(vm)
    // 初始化 _provided
    initProvide(vm) // resolve provide after data/props
    // 执行 created 生命周期钩子函数
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }
    // 有 el, 执行 $mount 方法
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}

export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  // 拿到 Sub 函数的 options(components、filters、directives)
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

export function resolveConstructorOptions (Ctor: Class<Component>) {
  let options = Ctor.options
  if (Ctor.super) { // super 属性在 Vue.extend 会赋值
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    // 处理 superOptions 混入新的数据的时候
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}

function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  const latest = Ctor.options
  const sealed = Ctor.sealedOptions // 当前 options 和 superOptions 合并后都值
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  return modified
}
