# rollup 教程

## 概述

`Rollup` 是一个 `JavaScript` 模块打包器，可以将小块代码编译成大块复杂的代码，例如 `vue` 的 `2.x`

`Rollup` 对代码模块使用新的标准化格式，这些标准都包含在 `JavaScript` 的 `ES6` 版本中，而不是以前的特殊解决方案，如 `CommonJS` 和 `AMD` `。ES6` 模块可以使你自由、无缝地使用你最喜爱的 `library` 中那些最有用独立函数，而你的项目不必携带其他未使用的代码。`ES6` 模块最终还是要由浏览器原生实现，但当前 `Rollup` 可以使你提前体验。

## 快速入门指南

### 安装

```shell
// 全局安装
npm install rollup --global
yarn add  rollup --global

// 局部安装
npm install rollup -D
yarn add rollup -D
```

Rollup 可以通过命令行接口([command line interface](https://rollupjs.org/guide/en/#command-line-reference))配合可选配置文件(optional configuration file)来调用，或者可以通过 [JavaScript API](https://rollupjs.org/guide/en/#javascript-api) 来调用。

运行 `rollup --help` 或 `npx rollup --help` 可以查看可用的选项和参数。

### 运行

这些命令假设应用程序入口起点的名称为 `main.js`，并且你想要所有 import 的依赖(all imports)都编译到一个名为 `bundle.js` 的单个文件中。

对于浏览器：

```shell
# compile to a <script> containing a self-executing function ('iife')
$ rollup main.js --file bundle.js --format iife
```

对于 Node.js:

```shell
# compile to a CommonJS module ('cjs')
$ rollup main.js --file bundle.js --format cjs
```

对于浏览器和 Node.js:

```shell
# UMD format requires a bundle name
$ rollup main.js --file bundle.js --format umd --name "myBundle"
```

`--format` 命令参数以不同的规范格式打包输出到目标文件中

## 命令行

我们一般在命令行中使用 `Rollup`。你也可以提供一份配置文件（可要可不要）来简化命令行操作，同时还能启用 `Rollup` 的高级特性

### 配置文件

Rollup的配置文件是可选的，但是使用配置文件的作用很强大，而且很方便

配置文件是一个 `ES6` 模块，它对外暴露一个对象，这个对象包含了一些 `Rollup` 需要的一些选项。通常，我们把这个配置文件叫做 `rollup.config.js` ，它通常位于项目的根目录

```js
// rollup.config.js
export default {
  // 核心选项
  input,     // 必须
  external,
  plugins,

  // 额外选项
  onwarn,

  // danger zone
  acorn,
  context,
  moduleContext,
  legacy

  output: {  // 必须 (如果要输出多个，可以是一个数组)
    // 核心选项
    file,    // 必须
    format,  // 必须
    name,
    globals,

    // 额外选项
    paths,
    banner,
    footer,
    intro,
    outro,
    sourcemap,
    sourcemapFile,
    interop,

    // 高危选项
    exports,
    amd,
    indent
    strict
  },
};
```

你必须使用配置文件才能执行以下操作：

- 把一个项目打包，然后输出多个文件
- 使用Rollup插件, 例如 `rollup-plugin-node-resolve` 和 `rollup-plugin-commonjs` 。这两个插件可以让你加载Node.js里面的CommonJS模块

如果你想使用Rollup的自定义配置文件，记得在命令行里加上 `--config` 或者 `-c`

```shell
# 默认使用rollup.config.js
$ rollup --config

# 或者, 使用自定义的配置文件，这里使用my.config.js作为配置文件
$ rollup --config my.config.js
```

### 命令行参数

```shell
-c, --config <filename>     使用这个配置文件(默认使用 rollup.config.js)
-i, --input <filename>      打包的入口文件（必须）
-o, --file <output>         打包输出的文件 (如果没有这个参数，则直接输出到控制台)
-n, --name                  生成包名称
-w, --watch                 监听文件的变化
-f, --format <format>       输出的文件类型规范 (amd, cjs, esm, iife, umd)
-e, --external <ids>        将模块ID的逗号分隔列表排除
-g, --globals <pairs>       以 module ID:Global 键值对的形式，用逗号分隔开任何定义在这里模块ID定义添加到外部依赖
-h, --help                  输出 help 信息
-m, --sourcemap             生成 sourcemap (-m inline for inline map)
--amd.id                    AMD模块的ID，默认是个匿名函数
--amd.define                使用Function来代替 `define`
--no-strict                 在生成的包中省略 `use strict`
--no-conflict               对于UMD模块来说，给全局变量生成一个无冲突的方法
--intro                     在打包好的文件的块的内部(wrapper内部)的最顶部插入一段内容
--outro                     在打包好的文件的块的内部(wrapper内部)的最底部插入一段内容
--banner                    在打包好的文件的块的外部(wrapper外部)的最顶部插入一段内容
--footer                    在打包好的文件的块的外部(wrapper外部)的最底部插入一段内容
--interop                   包含公共的模块（这个选项是默认添加的）
```

打包格式

- amd – 异步模块定义，用于像RequireJS这样的模块加载器
- cjs – CommonJS，适用于 Node 和 Browserify/Webpack
- esm – 将软件包保存为 ES 模块文件，在现代浏览器中可以通过 `<script type=module>` 标签引入
- iife – 一个自动执行的功能，适合作为 `<script>` 标签。
- umd – 通用模块定义，以amd，cjs 和 iife 为一体
- system - SystemJS 加载器格式

### 外链(external -e/--external)

- 外部依赖的名称
- 一个已被找到路径的ID（像文件的绝对路径）

```js
// rollup.config.js
import path from 'path';

export default {
  ...,
  external: [
    'some-externally-required-library',
    path.resolve( './src/some-local-file-that-should-not-be-bundled.js' )
  ]
};
```

## 插件

- [rollup-plugin-node-resolve](https://github.com/rollup/rollup-plugin-node-resolve): 告诉 `Rollup` 如何查找外部模块
- [rollup-plugin-commonjs](https://github.com/rollup/rollup-plugin-commonjs): 将 `CommonJS` 模块转换为 `ES2015` 供 Rollup 处理

## rollup 打包 Vue 源码

```js
function genConfig (name) {
  const opts = builds[name]
  const config = {
    input: opts.entry, // 打包入口
    external: opts.external, // 外部模块或内部项目定义的模块，比如 vue-server-renderer、vue-template-compiler
    plugins: [ // 插件
      flow(),
      alias(Object.assign({}, aliases, opts.alias))
    ].concat(opts.plugins || []),
    output: {
      file: opts.dest, // 打包输出文件名称
      format: opts.format, // 打包规范
      banner: opts.banner, // 插入注释
      name: opts.moduleName || 'Vue' // 导出模块名称
    },
    onwarn: (msg, warn) => { // 警告
      if (!/Circular/.test(msg)) {
        warn(msg)
      }
    }
  }

  return config
}
```

### 参考文档

- [rollup.js 中文文档](https://www.rollupjs.com/guide/big-list-of-options#%E5%A4%96%E9%93%BEexternal--e--external)
- [rollup.js](https://rollupjs.org/guide/en/)
- [JavaScript模块打包工具Rollup——完全入门指南](http://www.sosout.com/2018/08/04/rollup-tutorial.html)
- [使用 Rollup 构建你的 Library](https://zhuanlan.zhihu.com/p/34218678)