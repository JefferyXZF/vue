/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */
/**
 * 定义 arrayMethods 对象，用于增强 Array.prototype
 * 当访问 arrayMethods 对象上的那七个方法时会被拦截，以实现数组响应式
 */
import { def } from '../util/index'

const arrayProto = Array.prototype
// 通过继承的方式创建新的 arrayMethods
export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  // 缓冲原始数组的方法
  const original = arrayProto[method]
  // 利用Object.defineProperty对方法的执行进行改写
  def(arrayMethods, method, function mutator (...args) {
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    // 对新插入的元素做响应式处理
    if (inserted) ob.observeArray(inserted)
    // notify change
    ob.dep.notify()
    return result
  })
})
