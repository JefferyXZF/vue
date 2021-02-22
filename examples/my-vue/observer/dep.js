
let uid = 0
/**
 * 依赖管理器
 * @export
 * @class Dep
 */
export default class Dep {
  static target;
  id;
  subs;

  constructor () {
    this.id = uid++
    this.subs = []
  }

  /**
   * 添加 watch 依赖
   * @param {*} sub
   * @memberof Dep
   */
  addSub(sub) {
    this.subs.push(sub)
  }

  /**
   * 移除 watch 依赖
   * @param {*} sub
   * @memberof Dep
   */
  removeSub(sub) {
    remove(this.subs, sub)
  }

  /**
   * 收集依赖
   */
  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  /**
   * 派发更新
   * @memberof Dep
   */
  notify () {
    const subs = this.subs.slice()

    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}

function remove (arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item)

    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}