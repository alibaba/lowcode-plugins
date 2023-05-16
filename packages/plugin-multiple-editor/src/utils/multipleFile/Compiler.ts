import { transpile } from './babel/compile';
import {
  REQUIRE_IMPL_TEMPLATE,
  CREATE_REQUIRE,
  GLOBAL_CONTENT,
  GLOBAL_VAR_NAME,
} from './constants';
import { ObjectType } from './types';

export interface CompilerCtrOpts {
  files: ObjectType<string>;
  entry?: string; // 入口文件名，默认 index.js
  presets?: any[];
  plugins?: any[];
  clearDefault?: boolean;
  es6?: boolean;
}

export class Compiler {
  private fileMap: ObjectType<string> = {};

  private entry: string;

  private compiledMap: ObjectType<string>;

  constructor(private options: CompilerCtrOpts) {
    this.fileMap = options.files;
    this.entry = options.entry || 'index.js';
    this.compiledMap = {};
  }

  public compile() {
    const { plugins, presets, clearDefault } = this.options;
    for (const file of Object.keys(this.fileMap)) {
      this.compiledMap[file.replace(/(^\.?\/)|(\.jsx?)/g, '')] = transpile(
        {
          name: file,
          content: this.fileMap[file],
        },
        { plugins, presets, clearDefault, es6: this.options.es6 }
      );
    }
    return this.getFinalCompiled();
  }

  private getFinalCompiled() {
    // const entryCompiled = this.compiledMap[this.entry.replace(/\.jsx?/, '')];
    return `
    ${GLOBAL_CONTENT}
    ${REQUIRE_IMPL_TEMPLATE}
    ${CREATE_REQUIRE}
    ${GLOBAL_VAR_NAME}.__createRequire = __createRequire;
    ${GLOBAL_VAR_NAME}.__require_impl__ = __require_impl__;
    var __toExecFileMap__ = ${this.toString()};
    
    var exports = {};
    var __require__ = __createRequire('index.js');
    var entryExports = __require__('index');
    exports.default = entryExports.default || entryExports;
    `;
  }

  private toString() {
    return `
      {
        ${Object.keys(this.compiledMap)
    .map((k) => {
      let finalContent = JSON.stringify(this.compiledMap[k]);
      // 所有 js 文件，替换 this为固定字符串（避免引擎对this的处理影响）
      finalContent = finalContent.replace(/this/g, 'CODE_PLACEHOLDER');

      return `['${k}']: ${finalContent},`;
    })
    .join('\n')}
      }
    `;
  }
}
