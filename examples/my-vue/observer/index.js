import Dep from './dep'

export class Observer {
  value;
  dep;
  vmCount;

  constructor (value) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0

    // __ob__属性是作为响应式对象的标志，不可枚举
    def(value, '__ob__', this)
  }

}

export function observe (value) {
  if (!isObject(value)) return

  let ob
  // 缓存响应式
  if (value.hasOwnProperty('__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if ((Array.isArray(value) || isPlainObject(value)) &&
  Object.isExtensible(value) &&
  !value._isVue) {
    ob = new Observer(value)
  }

  return ob
}
/**
 * 定义响应式
 * @param {*} obj 
 * @param {*} key 
 * @param {*} val 
 */
export function defineReactive(obj, key, val) {
  const dep = new Dep()
  let childOb = observe(val) // 值是对象类型，递归处理响应式

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      // 收集依赖
      if (Dep.target) {
        dep.depend()
        if (childOb) { // 值是对象、数组类型，添加依赖收集
          childOb.dep.depend()
          if (Array.isArray(val)) { // 数组类型，对每一项做依赖收集
            dependArray(val)
          }
        }
      }
      return val
    },
    set: function (newVal) {
      if (val === newVal) {
        return
      }
      val = newVal
      childOb = observe(newVal) // 新值响应式
      dep.notify() // 派发更新
    }
  })
}

function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

function isPlainObject (obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}
function def (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
} 

function dependArray (value) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i]
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) { // 递归处理数组依赖收集
      dependArray(e)
    }
  }
}