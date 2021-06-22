function noop () {}
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

function proxy (target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}


class Vue {
  constructor(options) {
    this._init(options)
  }

  _init (options) {
    const vm = this
    this.$options = options;
    this.initState(vm)
    // 有 el, 执行 $mount 方法
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }

  initState(vm) {
      // vm._watchers = []
      const opts = vm.$options
      // 调用 observe 方法设置 data 为响应式，并且避免和 props、methods 重名
      if (opts.data) {
        initData(vm)
      } else {
        observe(vm._data = {})
      }

      if (opts.methods) initMethods(vm, opts.methods)

      // 初始化 computed
      if (opts.computed) initComputed(vm, opts.computed)

      // 初始化 watch
      if (opts.watch) initWatch(vm, opts.watch)

    }

    // 对外暴露调用订阅者的接口，内部主要在指令中使用订阅者
    $watch(expOrFn, cb, options) {
      const vm = this
      options = options || {}
      options.user = true
      const watcher = new Watcher(this, expOrFn, cb, options);
      // 立即执行
      if (options.immediate) {
        try {
          cb.call(vm, watcher.val)
        } catch (error) {
          console.error(`callback for immediate watcher "${watcher.expression}"`)
        }
      }
      // 取消监听
      return function unwatchFn () {
        watcher.teardown()
      }

    }

    $mount(el) {
      // 直接改写innerHTML
      const vm = this
      let innerHtml = el && document.querySelector(el)

      const updateComponent = () => {
        if (innerHtml) {
          let template = ''
          if (this.$options.template) {
            template = this.$options.template
          }
          innerHtml = compileText(this, template)

          document.querySelector(el).innerHTML = innerHtml

          setTimeout(() => {
            document.querySelector('#changeNum').addEventListener('click', () => {
              console.log('333')
              vm['changeNum']()
            })
          }, 0)
        }
      }
      // 创建一个渲染的依赖。
      new Watcher(this, updateComponent, noop, {
        before () {
          // beforeUpdate 钩子函数
        }
      }, true)
    }
  }

  const defaultTagRE = /\{\{(\w+?)\}\}/g

  function compileText (vm, html) {
    const tagRE = defaultTagRE
    if (!tagRE.test(html)) {
      return
    }

    let match
    while ((match = tagRE.exec(html))) {
      html = html.replace(match[0], vm[match[1]])
    }
    return html
  }

/**
 * 初始化 data
 * @param {*} vm
 */
function initData(vm) {
  let data = vm.$options.data
  // 定义私有属性 _data, 根实例时，data是一个对象，子组件的data是一个函数
  data = vm._data = typeof data === 'function'
    ? data.call(vm, vm)
    : data || {}

  const keys = Object.keys(data)
  let i = keys.length
  while (i--) {
    const key = keys[i]
    proxy(vm, `_data`, key)
  }
  observe(data)
}

function initMethods(vm, methods) {
  for (const key in methods) {
    vm[key] = typeof methods[key] !== 'function' ? noop : methods[key].bind(vm)
  }
}

const computedWatcherOptions = { lazy: true }
function initComputed(vm, computed) {
  const watchers = vm._computedWatchers = Object.create(null)

  for (const key in computed) {
    const userDef = computed[key]
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    // 要保证有getter方法
    if (getter == null) {
      console.error(
        `Getter is missing for computed property "${key}".`
      )
    }

    watchers[key] = new Watcher(
      vm,
      getter || noop,
      noop,
      computedWatcherOptions
    )

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    if (!(key in vm)) {
      // 设置为响应式数据
      defineComputed(vm, key, userDef)
    } else if (process.env.NODE_ENV !== 'production') {
      // 不能和props，data命名冲突
      if (key in vm.$data) {
        console.error(`The computed property "${key}" is already defined in data.`)
      } else if (vm.$options.props && key in vm.$options.props) {
        console.error(`The computed property "${key}" is already defined as a prop.`)
      }
    }
  }
}

function defineComputed (
  target,
  key,
  // userDef
) {

  sharedPropertyDefinition.get = createComputedGetter(key)
  sharedPropertyDefinition.set = noop

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
      return watcher.val
    }
  }
}

/**
 *初始化 watch
 * @param {*} vm
 * @param {*} watch
 */
function initWatch(vm, watch) {
  if (!watch || typeof watch !== 'object') {
    return
  }

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

function createWatcher (
  vm,
  expOrFn,
  handler,
  options
) {
  if (typeof handler === 'object') {
    options = handler
    handler = handler.handler
  }
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  return vm.$watch(expOrFn, handler, options)
}

let uid = 0;
// 发布中心 存储订阅者 -发布订阅
class Dep {
  constructor() {
    // 设置id,用于区分新Watcher和只改变属性值后新产生的Watcher
    this.id = uid++;
    // 储存订阅者的数组
    this.subs = [];
  }

  // 添加订阅者
  addSub(sub) {
    this.subs.push(sub);
  }

  // 监测是否已经存在sub中
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  }

  notify() {
    // 通知所有的订阅者(Watcher)
    this.subs.forEach(sub => sub.update());
  }
}

function parsePath (path) {
  if (!path) return

  const segments = path.split('.')
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]]
    }
    return obj
  }
}

/**
 * 订阅者对象
 * @class Watcher
 */
class Watcher {
  constructor(vm, expOrFn, cb, options, isRenderWatcher) {
    this.vm = vm; // 被订阅的数据一定来自于当前Vue实例
    if (isRenderWatcher) {
      this.vm._watcher = isRenderWatcher
    }
    if (options) {
      if (options.user) {
        this.user = options.user
      }
      if (options.lazy) {
        this.lazy = options.lazy
      }
    }
    this.cb = cb
    this.dirty = this.lazy
    this.depIds = new Set(); // hash储存订阅者的id,避免重复的订阅者
    this.deps = []
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn; // 当数据更新时想要做的事情
    } else {
      this.getter = parsePath(expOrFn)
    }
    // computed watcher 不执行get
    this.val = this.lazy ? undefined : this.get()
  }

  // 对外暴露的接口，用于在订阅的数据被更新时，由订阅者管理员(Dep)调用
  update() {
    this.run();
  }

  addDep(dep) {
    // 如果在depIds的hash中没有当前的id,可以判断是新Watcher,因此可以添加到dep的数组中储存
    // 此判断是避免同id的Watcher被多次储存
    const id = dep.id
    if (!this.depIds.has(id)) {
      this.depIds.add(id)
      this.deps.push(dep)

      dep.addSub(this);
      console.log(dep)
    }else {
      //   console.log(dep.id,'重复订阅')
        return;
    }
  }

  run() {
    const val = this.get();

    if (val !== this.val) {
      const oldVal = this.val
      this.val = val;
      this.cb.call(this.vm, val, oldVal);
    }
  }

  get() {
    // 当前订阅者(Watcher)读取被订阅数据的最新更新后的值时，通知订阅者管理员收集当前订阅者
    pushTarget(this)
    const vm = this.vm
    const val = this.getter.call(vm, vm)
    // 置空，用于下一个Watcher使用
    popTarget()
    return val;
  }

  /**
   * 专门为 computed watch 设计的方法
   * @memberof Watcher
   */
  evaluate () {
    this.val = this.get()
    this.dirty = false
  }

  /**
   * Depend on all deps collected by this watcher.
   * 收集所有的 watch
   */
  depend () {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }

  teardown () {
    if (this.active) {
      // remove self from vm's watcher list
      // this is a somewhat expensive operation so we skip it
      // if the vm is being destroyed.
      // if (!this.vm._isBeingDestroyed) {
      //   remove(this.vm._watchers, this)
      // }
      // let i = this.deps.length
      // while (i--) {
      //   this.deps[i].removeSub(this)
      // }
      // this.active = false
    }
  }
}
// 为Dep类设置一个静态属性,默认为null,工作时指向当前的Watcher
Dep.target = null
const targetStack = []

function pushTarget (target) {
  targetStack.push(target)
  Dep.target = target
}

function popTarget () {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
// 监听者,监听对象属性值的变化
class Observer {
  constructor(value) {
    this.value = value;
      // 遍历属性值
    if (Array.isArray(value)) {

    } else {
      this.walk(value)
    }
  }

  walk(obj) {
    const keys = Object.keys(obj);
    for(let i = 0;i< keys.length; i++) {
      // Object.defineProperty的处理逻辑
      defineReactive(obj, keys[i], obj[keys[i]])
    }
  }
}

function defineReactive(obj, key, val) {
  const dep = new Dep();
  // 给当前属性的值添加监听
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: () => {
      // 如果Dep类存在target属性，将其添加到dep实例的subs数组中
      // target指向一个Watcher实例，每个Watcher都是一个订阅者
      // Watcher实例在实例化过程中，会读取data中的某个属性，从而触发当前get方法
      if (Dep.target) {
        dep.depend();
      }
      return val;
    },
    set: newVal => {
      if (val === newVal) return;
      val = newVal;
      // 对新值进行监听
      // 通知所有订阅者，数值被改变了
      dep.notify();
    },
  });
}

function observe(value) {
  // 不考虑复杂类型  源码递归实现
  if (!value || typeof value !== 'object') {
    return;
  }
  return new Observer(value);
}


(function(global, factory) {
  global && (global = factory)
})(this, Vue)

