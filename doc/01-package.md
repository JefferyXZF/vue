# package.json 属性详解

## 概述

学习前端开源项目或接触新项目的时候，经常会从阅读 `package.json` 文件开始了解这个项目，但是这个文件有很多属性，经常记不住这些属性的作用和使用方法。今天，从学习 vue 开源项目，掌握 `package.json` 常用属性的用法。

## vue 的 package.json 示例

```json
{
  "name": "vue",
  "version": "2.6.12",
  "description": "Reactive, component-oriented view layer for modern web interfaces.",
  "main": "dist/vue.runtime.common.js", // 指定了程序的主入口文件(CommonJs规范)
  "module": "dist/vue.runtime.esm.js",
  "unpkg": "dist/vue.js", // 在 npm 上所有文件都开启CDN服务
  "jsdelivr": "dist/vue.js", // 开启一个开源,免费的CDN服务
  "typings": "types/index.d.ts", // 一个TypeScript的入口文件
  "files": [ // 内容是模块下文件名,或者文件夹名,如果是文件夹名,则文件夹下所有的文件也会包含进来
    "src",
    "dist/*.js",
    "types/*.d.ts"
  ],
  "sideEffects": false, // 声明模块是否包含sideEffects（副作用）,从而可以为tree-shaking 提供更大的优化空间
  "scripts": {
    "dev": "rollup -w -c scripts/config.js --source-map --environment TARGET:web-full-dev"
  },
  "gitHooks": { // githooks是一个工具，轻松地构建git的自定义钩子
    "pre-commit": "lint-staged",
    "commit-msg": "node scripts/verify-commit-msg.js"
  },
  "lint-staged": { // 使用git提交时检测代码
    "*.js": [
      "eslint --fix",
      "git add"
    ]
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/vuejs/vue.git"
  },
  "keywords": [
    "vue"
  ],
  "author": "Evan You",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/vuejs/vue/issues"
  },
  "homepage": "https://github.com/vuejs/vue#readme",
  "devDependencies": {

  },
  "config": { // 用来配置用于包脚本的跨版本参数
    "commitizen": {
      "path": "./node_modules/cz-conventional-changelog"
    }
  }
}

```

## name

 `name` 是项目的名称。

 name 和 version 是 package.json 中最重要的两个字段，也是发布到 NPM 平台上的唯一标识，如果没有正确设置这两个字段，包就不能发布和被下载。

使用规则：

- name 必须小于等于214个字节，包括前缀名称在内（如 xxx/xxxmodule）。
- name 不能以"_"或"."开头
- 不能含有大写字母
- name会成为url的一部分，不能含有url非法字符

使用 tips：

- 名字里不要再包含 `js` 和 `node` 
- 名字会作为require()命令的参数，所以应该尽量简明
- 如果包要发布到NPM平台上的话，最好先检查下有没有重名, 并且字母只能全部小写
- 新版本的NPM可以指定scope, 名字可以加前缀标识，如 `@zhansan/mypackage`

示例：

```js
{
  "name": "vue"
}
```

## version

项目的当前版本。

示例：

```js
{
  "version": "2.6.12",
}
```

该属性遵循语义版本控制规范，这意味着版本始终以 3 个数字表示：x.x.x。

第一个数字是主版本号，第二个数字是次版本号，第三个数字是补丁版本号。

这些数字中的含义是：具有重大更改的是主版本，引入向后兼容的更改的版本是次版本，修复缺陷的版本是补丁版本

## description

项目的简短描述。

示例：

```js
{
  "description": "Reactive, component-oriented view layer for modern web interfaces."
}
```

## main

指定项目加载的入口文件，`require('vue')` 就会加载这个文件路径。这个字段的默认值是模块根目录下面的index.js。

示例：

```js
{
  "main": "dist/vue.runtime.common.js"
}
```

## private

如果设置为 true，则可以防止应用程序、项目被意外地发布到 npm。

示例：

```js
{
  "private": true
}
```

## module

 定义 npm 包的 ESM 规范的入口文件，browser 环境和 node 环境均可使用

 示例：

 ```js
 {
   "module": "dist/vue.runtime.esm.js",
 }
 ```

## unpkg

让 `npm` 上所有的文件都开启 cdn 服务

```js
{
  "unpkg": "dist/vue.js"
}
```

## jsdelivr

jsDelivr 为其他有特殊要求的项目提供了npm

示例：

```js
{
  "jsdelivr": "dist/vue.js"
}
```

## typings

定义一个针对 `TypeScript` 的入口文件

```js
{
  "typings": "types/index.d.ts"
}
```

## files

"files"属性的值是一个数组，内容是上传 npm 模块下文件名或者文件夹名，如果是文件夹名，则文件夹下所有的文件也会被包含进来（除非文件被另一些配置排除了）

你也可以在模块根目录下创建一个".npmignore"文件（windows下无法直接创建以"."开头的文件，使用linux命令行工具创建如git bash），写在这个文件里边的文件即便被写在files属性里边也会被排除在外，这个文件的写法".gitignore"类似。

示例

```js
{
  "files": [
    "src",
    "dist/*.js",
    "types/*.d.ts"
  ]
}
```

## sideEffects

声明该模块是否包含副作用，从而可以为 `tree-shaking` 提供更大的优化空间，false 表示没有副作用，可以开启

```js
{
  "sideEffects": false
}
```

## scripts

定义一组可以运行的 node 脚本

示例：

```js
"scripts": {
    "dev": "rollup -w -c scripts/config.js --source-map --environment TARGET:web-full-dev",
    "build": "node scripts/build.js",
    "test": "npm run lint && flow check && npm run test:types && npm run test:cover && npm run test:e2e -- --env phantomjs && npm run test:ssr && npm run test:weex",
    "flow": "flow check",
    "sauce": "karma start test/unit/karma.sauce.config.js",
    "bench:ssr": "npm run build:ssr && node benchmarks/ssr/renderToString.js && node benchmarks/ssr/renderToStream.js",
    "release": "bash scripts/release.sh",
    "release:weex": "bash scripts/release-weex.sh",
    "release:note": "node scripts/gen-release-note.js",
    "commit": "git-cz"
}
```

## gitHooks

代码提交执行钩子,它结合 `lint-staged` 使用

```js
{
  "gitHooks": {
    "pre-commit": "lint-staged",
    "commit-msg": "node scripts/verify-commit-msg.js"
  }
}
```

上面命令会执行 `lint-staged` 和 `node scripts/verify-commit-msg.js` 进行代码提交规范校验

## lint-staged

代码提交校验

示例：

```js
"lint-staged": {
  "*.js": [
    "eslint --fix",
    "git add"
  ]
}
```

上面代码执行进行 `eslint` 代码校验，添加代码到仓库

## repository

指定项目仓库所在的位置。

示例：

```js
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/vuejs/vue.git"
  }
}
```

## keywords

包含与项目功能相关的关键字数组

示例：

```js
{
  "keywords": [
    "vue"
  ]
}
```

这有助于人们在浏览相似的软件包或浏览 [https://www.npmjs.com/](https://www.npmjs.com/) 网站时找到你的软件包

## author

项目的作者名称

示例：

```js
{
  "author": "Evan You"
}
```

也可以使用以下格式：

```js
{
  "author": {
    "name": "Evan You",
    "email": "mail@xxx.cn",
    "url": "http://xxx.cn"
  }
}
```

## contributors

除作者外，该项目可以有一个或多个贡献者。 此属性是列出他们的数组。

示例：

```js
{
  "contributors": [
    "张三",
    "李四"
  ]
}
```

也可以使用以下格式

```js
{
  "contributors": [
    {
      "name": "Evan You",
      "email": "mail@xxx.cn",
      "url": "http://xxx.cn"
    }
  ]
}
```

## license

指定项目的许可证。

示例：

```js
{
  "license": "MIT"
}
```

## bugs

链接到项目的问题跟踪器，最常用的是 `GitHub` 的 `issues` 页面

```js
{
  "bugs": {
    "url": "https://github.com/vuejs/vue/issues"
  }
}
```

## homepage

设置项目的主页

```js
{
  "homepage": "https://github.com/vuejs/vue#readme"
}
```

## dependencies

指定项目运行所依赖的模块，依赖包在生产和开发环境中使用到

示例

```js
{
  "dependencies": {
    "vue": "^2.5.2"
  }
}
```

对应的版本可以加上各种限定，主要有以下几种：

- 指定版本：比如1.2.2，遵循“大版本.次要版本.小版本”的格式规定，安装时只安装指定版本。
- 波浪号 + 指定版本：比如 `~1.2.2`，表示安装1.2.x的最新版本（不低于1.2.2），但是不安装1.3.x，也就是说安装时不改变大版本号和次要版本号。
- 插入号 + 指定版本：比如ˆ1.2.2，表示安装1.x.x的最新版本（不低于1.2.2），但是不安装2.x.x，也就是说安装时不改变大版本号。需要注意的是，如果大版本号为0，则插入号的行为与波浪号相同，这是因为此时处于开发阶段，即使是次要版本号变动，也可能带来程序的不兼容。
- latest：安装最新版本。

## devDependencies

指定项目开发所需要的模块，依赖包仅在开发环境中使用到

示例：

```js
"devDependencies": {
  "@babel/core": "^7.0.0",
  "@babel/plugin-proposal-class-properties": "^7.1.0",
  "@babel/plugin-syntax-dynamic-import": "^7.0.0",
  "@babel/plugin-syntax-jsx": "^7.0.0"
}
```

当使用 npm 或 yarn 安装软件包的命令：

```shell
npm install --save-dev <PACKAGENAME>
yarn add --dev <PACKAGENAME>

```

## peerDependencies

用来供插件指定其所需要的主工具的版本

```js
{
  "name": "element3",
  "peerDependencies": {
    "vue": "3.x"
  }
}
```

安装 `element3` 模块时，主程序 `vue` 必须一起安装，而且 `vue` 的版本必须是 `3.x`。如果你的项目指定的依赖是`vue` 的 2.0 版本，就会报错。

## engines

项目要运行的 Node.js 或其他命令的版本

示例：

```js
{
  "engines": {
    "node": ">= 6.0.0",
    "npm": ">= 3.0.0",
    "yarn": "^0.13.0"
  }
}
```

## browserslist

告知要支持哪些浏览器（及其版本）。 Babel、Autoprefixer 和其他工具会用到它，以将所需的 polyfill 和 fallback 添加到目标浏览器。

```js
{
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not ie <= 8"
  ]
}
```

此配置意味着需要支持使用率超过 1％（来自 [CanIUse.com](https://caniuse.com/) 的统计信息）的所有浏览器的最新的 2 个主版本，但不含 IE8 及更低的版本。

## style

声明当前模块包含 `style` 部分，并制定入口文件

支持的工具

- parcelify
- npm-less
- rework-npm
- npm-css

示例：

```js
{
  "style": [
    "./node_modules/tipso/src/tipso.css"
  ]
}
```

## bin

指定各个内部命令对应的可执行文件的位置

示例：

```js
{
  "bin": {
    "someTool": "./bin/someTool.js"
  }
}
```

上面代码指定，someTool 命令对应的可执行文件为 bin 子目录下的 someTool.js。Npm会寻找这个文件，在`node_modules/.bin/` 目录下建立符号链接。在上面的例子中，someTool.js 会建立符号链接 `node_modules/.bin/someTool`。由于 `node_modules/.bin/` 目录会在运行时加入系统的PATH变量，因此在运行npm时，就可以不带路径，直接通过命令来调用这些脚本。

因此，像下面这样的写法可以采用简写。

```js
scripts: {  
  start: './node_modules/bin/someTool.js build'
}

// 简写为

scripts: {  
  start: 'someTool build'
}
```

## config

添加命令行的环境变量

示例：

```js
{
  "config" : { "port" : "8080" }
}
```

## 参考文档

- [package.json 指南-nodejs](http://nodejs.cn/learn/the-package-json-guide)
- [package.json-官方](https://docs.npmjs.com/cli/v6/configuring-npm/package-json#bundleddependencies)
- [package.json文件 - JavaScript 标准参考教程(阮一峰)](https://javascript.ruanyifeng.com/nodejs/packagejson.html#toc3)
- [npm package.json属性详解 - 知乎](https://www.zhihu.com/column/p/23311680)