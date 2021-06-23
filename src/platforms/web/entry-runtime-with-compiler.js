/* @flow */

import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

/**
 * cached 闭包函数实现缓存，获取元素 DOM 的 innerHTML
 */
const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

// 缓存 $mount 方法
const mount = Vue.prototype.$mount
/**
 * 重写 $mount 方法，使用 compileToFunctions 编译 template 或 el 为 render 函数
 * @param {*} el
 * @param {*} hydrating
 */
Vue.prototype.$mount = function (
  el?: string | Element, // 接收字符串或 DOM 元素
  hydrating?: boolean // 是否是服务端渲染
): Component {
  
  // query 用 document.querySelect 来查找 DOM
  el = el && query(el) 

  /* istanbul ignore if */
  // 不能挂载在 body 或 html 标签下
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  // $options 是在调用 _init 方法中，mergeOption 选项合并赋值
  const options = this.$options
  /**
   * 如果用户提供了 render 配置项，则直接跳过编译阶段，否则进入编译阶段
   *   解析 template 和 el，并转换为 render 函数
   *   优先级：render > template > el
   */
  if (!options.render) {
    let template = options.template
    // template 值可以是 id 标识，DOM, 和 组件字符串占位符
    if (template) {
      // 针对字符串模板和选择符匹配模板
      if (typeof template === 'string') {
        // template 是 dom 元素的 id 属性
        if (template.charAt(0) === '#') {
           // idToTemplate 函数取 template 的字符串内容，并且根据 id 缓存下来
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
       // 如果没有传入template模板，则默认以el元素所属的根节点作为基础模板
      template = getOuterHTML(el)
    }
    if (template) {
      /* istanbul ignore if */
      // 性能分析
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }

      // 模板编译成 render 和 staticRenderFns 函数
      // 路径：src/compiler/to-function.js
      // 编译模版，得到 动态渲染函数和静态渲染函数
      // 使用了闭包和函数柯里化、缓存
      const { render, staticRenderFns } = compileToFunctions(template, {
         // 在非生产环境下，编译时记录标签属性在模版字符串中开始和结束的位置索引
        outputSourceRange: process.env.NODE_ENV !== 'production',
        // boolean 值，IE在属性值中编码换行，而其他浏览器则不编码换行
        shouldDecodeNewlines,
        // boolean 值，是否编码 a 标签 href 属性中的换行
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters, // 改变纯文本插入分隔符，当不传递值时，Vue默认的分隔符为 {{}}
        comments: options.comments //  当设为 true 时，将会保留且渲染模板中的 HTML注释。默认行为是舍弃它们
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  // 最后重新调用缓存的 $mount方法
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions

export default Vue
