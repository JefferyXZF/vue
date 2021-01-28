/* @flow */

import config from '../config'
import Watcher from '../observer/watcher'
import Dep, { pushTarget, popTarget } from '../observer/dep'
import { isUpdatingChildComponent } from './lifecycle'

import {
  set,
  del,
  observe,
  defineReactive,
  toggleObserving
} from '../observer/index'

import {
  warn,
  bind,
  noop,
  hasOwn,
  hyphenate,
  isReserved,
  handleError,
  nativeWatch,
  validateProp,
  isPlainObject,
  isServerRendering,
  isReservedAttribute
} from '../util/index'

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

export function proxy (target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props) //  设置 props 为响应式，并代理
  if (opts.methods) initMethods(vm, opts.methods) // 将 methods 方法挂载在vm上
  // 调用 observe 方法设置 data 为响应式，并且避免和 props、methods 重名
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed) // 初始化 computed 的 get 和 set 方法
  // 初始化 watch
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
/**
 * @description 实现流程：
 * 1、检验props的key, 取得 value 值（不会对接收父组件的嵌套对象做响应式处理，因为父组件在内层已经实现了响应式。不过会对 props 的 default 默认值做嵌套的响应式处理）
 * 2、defineReactive 定义响应式对象
 * 3、将 props 的key代理到 vm
 * @author jeffery
 * @date 2020-12-30
 * @param {Component} vm
 * @param {Object} propsOptions
 */
function initProps (vm: Component, propsOptions: Object) {
  const propsData = vm.$options.propsData || {}
  // 定义私有属性 _props
  const props = vm._props = {}
  // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.
  const keys = vm.$options._propKeys = []
  const isRoot = !vm.$parent
  // root instance props should be converted
  if (!isRoot) {
    toggleObserving(false)
  }
  for (const key in propsOptions) {
    keys.push(key)
    const value = validateProp(key, propsOptions, propsData, vm)
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      const hyphenatedKey = hyphenate(key)
      if (isReservedAttribute(hyphenatedKey) ||
          config.isReservedAttr(hyphenatedKey)) {
        warn(
          `"${hyphenatedKey}" is a reserved attribute and cannot be used as component prop.`,
          vm
        )
      }
      // 定义 setter 方法，props 值只读
      defineReactive(props, key, value, () => {
        if (!isRoot && !isUpdatingChildComponent) {
          warn(
            `Avoid mutating a prop directly since the value will be ` +
            `overwritten whenever the parent component re-renders. ` +
            `Instead, use a data or computed property based on the prop's ` +
            `value. Prop being mutated: "${key}"`,
            vm
          )
        }
      })
    } else {
      defineReactive(props, key, value)
    }
    // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.
    if (!(key in vm)) {
      proxy(vm, `_props`, key)
    }
  }
  toggleObserving(true)
}

/**
 * @description 实现流程
 * 1、得到 data 对象
 * 2、检验data的 key是否和props、methods有重合
 * 3、将 data 的 key 不是 _、$ 代理到 vm上
 * 4、定义响应式对象 observe
 * @author jeffery
 * @date 2020-12-30
 * @param {Component} vm
 */
function initData (vm: Component) {
  let data = vm.$options.data
  // 定义私有属性 _data, 根实例时，data是一个对象，子组件的data是一个函数
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}
  if (!isPlainObject(data)) { // data 对象断言
    data = {}
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    )
  }
  // proxy data on instance
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods
  let i = keys.length
  while (i--) {
    const key = keys[i]
    if (process.env.NODE_ENV !== 'production') {
      // 命名不能和方法重复
      if (methods && hasOwn(methods, key)) {
        warn(
          `Method "${key}" has already been defined as a data property.`,
          vm
        )
      }
    }
    // 命名不能和props重复
    if (props && hasOwn(props, key)) {
      process.env.NODE_ENV !== 'production' && warn(
        `The data property "${key}" is already declared as a prop. ` +
        `Use prop default value instead.`,
        vm
      )
      // 数据代理，用户可直接通过vm实例返回data数据，命名不能以$、_开头
    } else if (!isReserved(key)) {
      proxy(vm, `_data`, key)
    }
  }
  // observe data
  // 将对象标识为响应式对象
  observe(data, true /* asRootData */)
}

export function getData (data: Function, vm: Component): any {
  // #7573 disable dep collection when invoking data getters
  pushTarget()
  try {
    return data.call(vm, vm)
  } catch (e) {
    handleError(e, vm, `data()`)
    return {}
  } finally {
    popTarget()
  }
}

const computedWatcherOptions = { lazy: true }

/**
 * @description
 * 1、computed可以是对象，也可以是函数，但是对象必须有getter方法,因此如果computed中的属性值是对象时需要进行验证。
 * 2、针对computed的每个属性，要创建一个监听的依赖，也就是实例化一个watcher,
 * watcher的定义，可以暂时理解为数据使用的依赖本身，一个watcher实例代表多了一个需要被监听的数据依赖。
 * @author jeffery
 * @date 2020-12-30
 * @param {Component} vm
 * @param {Object} computed
 */
function initComputed (vm: Component, computed: Object) {
  // $flow-disable-line
  const watchers = vm._computedWatchers = Object.create(null)
  // computed properties are just getters during SSR
  const isSSR = isServerRendering()

  for (const key in computed) {
    const userDef = computed[key]
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    // 要保证有getter方法
    if (process.env.NODE_ENV !== 'production' && getter == null) {
      warn(
        `Getter is missing for computed property "${key}".`,
        vm
      )
    }

    if (!isSSR) {
      // create internal watcher for the computed property.
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      )
    }

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    if (!(key in vm)) {
      // 设置为响应式数据
      defineComputed(vm, key, userDef)
    } else if (process.env.NODE_ENV !== 'production') {
      // 不能和props，data命名冲突
      if (key in vm.$data) {
        warn(`The computed property "${key}" is already defined in data.`, vm)
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(`The computed property "${key}" is already defined as a prop.`, vm)
      }
    }
  }
}

/**
 * @description 定义 computed 的 get 和 set 方法
 * @author jeffery
 * @date 2020-12-30
 * @export
 * @param {*} target
 * @param {string} key
 * @param {(Object | Function)} userDef
 */
export function defineComputed (
  target: any,
  key: string,
  userDef: Object | Function
) {
  // 非服务端渲染会对getter进行缓存
  const shouldCache = !isServerRendering()
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key)
      : createGetterInvoker(userDef)
    sharedPropertyDefinition.set = noop
  } else {
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : createGetterInvoker(userDef.get)
      : noop
    sharedPropertyDefinition.set = userDef.set || noop
  }
  if (process.env.NODE_ENV !== 'production' &&
      sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn(
        `Computed property "${key}" was assigned to but it has no setter.`,
        this
      )
    }
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

function createComputedGetter (key) {
  return function computedGetter () {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      // dirty是标志是否已经执行过计算结果，如果执行过则不会执行watcher.evaluate重复计算，这也是缓存的原理
      if (watcher.dirty) {
        watcher.evaluate()
      }
      // 将 computed watch 收集到当前 watch 实例下所有的 deps
      if (Dep.target) {
        watcher.depend()
      }
      return watcher.value
    }
  }
}

function createGetterInvoker(fn) {
  return function computedGetter () {
    return fn.call(this, this)
  }
}

/**
 * @description 实现流程：
 * 1、检验是否和 props 的 Key 重复
 * 2、检验 重复定义 methods 方法，并且不用使用 _ $ 开头
 * 3、将 methods 方法绑定在 vm 上
 * @author jeffery
 * @date 2021-01-19
 * @param {Component} vm
 * @param {Object} methods
 */
function initMethods (vm: Component, methods: Object) {
  const props = vm.$options.props
  for (const key in methods) {
    if (process.env.NODE_ENV !== 'production') {
      // method必须为函数形式
      if (typeof methods[key] !== 'function') {
        warn(
          `Method "${key}" has type "${typeof methods[key]}" in the component definition. ` +
          `Did you reference the function correctly?`,
          vm
        )
      }
      // methods方法名不能和props重复
      if (props && hasOwn(props, key)) {
        warn(
          `Method "${key}" has already been defined as a prop.`,
          vm
        )
      }
      //  不能以_ or $.这些Vue保留标志开头
      if ((key in vm) && isReserved(key)) {
        warn(
          `Method "${key}" conflicts with an existing Vue instance method. ` +
          `Avoid defining component methods that start with _ or $.`
        )
      }
    }
     // 直接挂载到实例的属性上,可以通过vm[method]访问。
    vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm)
  }
}

/**
 * @description 遍历 watch，判断是否是数组，为每一个watch创建createWatcher
 * @author jeffery
 * @date 2020-12-30
 * @param {Component} vm
 * @param {Object} watch
 */
function initWatch (vm: Component, watch: Object) {
  for (const key in watch) {
    const handler = watch[key]
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}

/**
 * @description 调用 $watch 方法
 * @author jeffery
 * @date 2020-12-30
 * @param {Component} vm
 * @param {(string | Function)} expOrFn
 * @param {*} handler
 * @param {Object} [options]
 * @returns
 */
function createWatcher (
  vm: Component,
  expOrFn: string | Function,
  handler: any,
  options?: Object
) {
  if (isPlainObject(handler)) {
    options = handler
    handler = handler.handler
  }
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  return vm.$watch(expOrFn, handler, options)
}

export function stateMixin (Vue: Class<Component>) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  const dataDef = {}
  dataDef.get = function () { return this._data }
  const propsDef = {}
  propsDef.get = function () { return this._props }
  if (process.env.NODE_ENV !== 'production') {
    dataDef.set = function () {
      warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      )
    }
    propsDef.set = function () {
      warn(`$props is readonly.`, this)
    }
  }
  Object.defineProperty(Vue.prototype, '$data', dataDef)
  Object.defineProperty(Vue.prototype, '$props', propsDef)

  Vue.prototype.$set = set
  Vue.prototype.$delete = del

  /**
   * user watch
   * 执行流程：实例化 user watch，会调用一次 getter 方法，访问到 vm[xxx], 触发 xxx getter 方法的依赖收集，将当前的 user watch 添加到 dep 下
   * 派发逻辑和之前的一样
   * @param {*} expOrFn
   * @param {*} cb
   * @param {*} options
   */
  Vue.prototype.$watch = function (
    expOrFn: string | Function,
    cb: any,
    options?: Object
  ): Function {
    const vm: Component = this
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    options = options || {}
    options.user = true
    const watcher = new Watcher(vm, expOrFn, cb, options)
     // 当watch有immediate选项时，立即执行cb方法，即不需要等待属性变化，立刻执行回调。
    if (options.immediate) {
      try {
        cb.call(vm, watcher.value)
      } catch (error) {
        handleError(error, vm, `callback for immediate watcher "${watcher.expression}"`)
      }
    }
    return function unwatchFn () {
      watcher.teardown()
    }
  }
}
