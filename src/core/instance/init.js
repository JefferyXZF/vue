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

/**
 * 定义 Vue.prototype._init 方法 
 * @param {*} Vue Vue 构造函数
 */
export function  initMixin (Vue: Class<Component>) {

  // 负责 Vue 的初始化过程
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // 每个 vue 实例都有一个 _uid，并且是依次递增的
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
    // 处理组件配置项，子组件选项合并 merge options，初始化 $options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      /**
       * 每个子组件初始化时走这里，这里只做了一些性能优化
       * 将组件配置对象上的一些深层次属性放到 vm.$options 选项中，以提高代码的执行效率
       */
      initInternalComponent(vm, options)
    } else {
       /**
       * 初始化根组件时走这里，合并 Vue 的全局配置到根组件的局部配置，比如 Vue.component 注册的全局组件会合并到 根实例的 components 选项中
       * 至于每个子组件的选项合并则发生在两个地方：
       *   1、Vue.component 方法注册的全局组件在注册时做了选项合并
       *   2、{ components: { xx } } 方式注册的局部组件在执行编译器生成的 render 函数时做了选项合并，包括根组件中的 components 配置
       */
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor), // 返回 Vue 构造函数自身的配置项
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    //  设置代理，将 vm 实例上的属性代理到 vm._renderProxy。使用场景：在 render 函数会用到，会进行数据的检测，如果数据没有定义在 vm 上，会报错提示
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    // 初始化组件实例关系属性，建立父子组件和根组件联系。初始化 $parent, $root, $children, $refs
    initLifecycle(vm)
    /**
     * 处理父组件自定义事件 @xxx，将它注册在子组件 $on 上
     * 初始化自定义事件，这里需要注意一点，我们在 <comp @click="handleClick" /> 上注册的事件，监听者不是父组件，
     * 而是子组件本身，也就是说事件的派发和监听者都是子组件本身，和父组件无关
     */
    initEvents(vm)
    //  解析组件的插槽信息，得到 vm.$slot，处理渲染函数，得到 vm.$createElement 方法，即 h 函数
    // 初始化 $slots, $scopedSlots, _c, $createElement, $attrs,  $listeners
    initRender(vm)
    // 执行 beforeCreate 生命周期钩子函数
    callHook(vm, 'beforeCreate')
    // 初始化组件的 inject 配置项，得到 result[key] = val 形式的配置对象，然后对结果数据进行响应式处理，并代理每个 key 到 vm 实例
    initInjections(vm) // resolve injections before data/props
    // 构建响应式系统, 初始化 props, methods, data, computed, watch
    initState(vm)
    // 解析组件配置项上的 provide 对象，将其挂载到 vm._provided 属性上
    initProvide(vm) // resolve provide after data/props
    // 执行 created 生命周期钩子函数
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }
    // 如果发现配置项上有 el 选项，则自动调用 $mount 方法，也就是说有了 el 选项，就不需要再手动调用 $mount，反之，没有 el 则必须手动调用 $mount
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

/**
 * 从组件构造函数中解析配置对象 options，并合并基类选项
 * @param {*} Ctor 
 * @returns 
 */
export function resolveConstructorOptions (Ctor: Class<Component>) {
  let options = Ctor.options
  if (Ctor.super) { // super 属性在 Vue.extend 会赋值
    // 存在基类，递归解析基类构造函数的选项
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    // 处理 superOptions 混入新的数据的时候
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      // 说明基类构造函数选项已经发生改变，需要重新设置
      Ctor.superOptions = superOptions
      // 检查 Ctor.options 上是否有任何后期修改/附加的选项，check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      // 如果存在被修改或增加的选项，则合并两个选项
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

/**
 * 解析构造函数选项中后续被修改或者增加的选项
 */
function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  const latest = Ctor.options
  // 密封的构造函数选项，备份
  const sealed = Ctor.sealedOptions // 当前 options 和 superOptions 合并后都值
  // 对比两个选项，记录不一致的选项
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  return modified
}
