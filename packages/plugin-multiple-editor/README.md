# 多文件编辑器

借助此插件可在低码引擎上使用任意层级的文件树进行代码的组织

## Demo

```ts
import multipleFileCodeEditorFactory from '@alilc/lowcode-plugin-multiple-editor';

import { PrettierPlugin } from '@alilc/lowcode-plugin-multiple-editor/es/plugins/prettier-plugin';


const PLUGIN_NAME = 'multiple-file-code-editor';
// 详细参数可见 ts 类型声明
const plugin: any = multipleFileCodeEditorFactory({
  softSave: true, // true 保存代码时将代码保存在插件类上，并不会调用引擎的 importSchema
  es6: true, // 编译选项，true 时仅做 es module 的编译
  // 可选择使用插进进行代码编辑器功能的拓展
  plugins: [searchPlugin as any, lintPlugin, new PrettierPlugin()],
  // 内置钩子，在插件初始化时进行一些操作，例如添加类型声明
  onInstall(controller: EditorController) {
    for (const [path, content] of extraLibList) {
      controller.addExtraLib(content, path);
    }
    controller.addComponentDeclarations(declarations);
    controller.onImportSchema(async (schema) => {
      // Todo sth.
    });
    window.codeEditorController = controller;
  },
  defaultFiles: {
    utils: `
export function helloWorld() {
  console.log('hello world');
}
    `
  }
});

plugin.pluginName = PLUGIN_NAME;

await plugins.register(plugin);
```

## 工作原理

使用该插件时，每次保存时：

1. 编译代码，生成 __initExtra 函数方法，该方法用于初始化各个方法、生命周期的真实定义
1. 修改 constructor 函数体，函数体内执行 __initExtra，constructor 将会在渲染引擎内执行，执行完成后即可得到所有方法和生命周期的真实定义
1. 在 schema 上保存一个文件 Map，保存位置为 `schema.componentsTree[0]._sourceCodeMap`

## 使用注意事项

1. 建议所有 project.importSchema 和 project.exportSchema 替换为 codeEditorController.importSchema 和 codeEditorController.exportSchema。原因是插件内部需要对文件内容进行处理
2. 不能在 index.js 的 Class 之外进行函数、变量定义，如需定义则在其他文件内定义
3. 不能在 index.js Class 的 state 定义中使用表达式
4. 如需在 setter 内适用类型定义，请开启 base-editor 的单例模式，仅需在应用入口处调用如下方法即可：
5. 如果低码项目有使用出码，则需对出码进行定制，将 _sourceCodeMap 中的文件生成到项目中，并对文件的引用进行处理，具体处理方式可自行组织

__使用单例模式__
```ts
import { configure } from '@alilc/lowcode-plugin-base-monaco-editor';
configure({ singleton: true });
```
