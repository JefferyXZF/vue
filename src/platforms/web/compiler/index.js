/* @flow */

// Web 平台的参数 baseOptions
import { baseOptions } from './options'
import { createCompiler } from 'compiler/index'

// 函数定义在 src/compiler/create-compiler.js
const { compile, compileToFunctions } = createCompiler(baseOptions)

export { compile, compileToFunctions }
