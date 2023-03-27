## 1.0.5 / 2022-11-28

- Fix 修正 UIPaaS 中针对 source 的异常提示问题

## 1.0.4 / 2022-11-18

- Fix 修正输入 / 粘贴时光标位置错误的 bug
- Fix 修复当上下文没有 originCode 时，通过 schema 中的局部 source 字段无法恢复 state 的问题

## 1.0.3 / 2022-07-11

- Fix 源码面板高度塌陷的 [bug](https://github.com/alibaba/lowcode-engine/issues/803)

## 1.0.2 / 2022-05-05

* Fix [schema export issue](https://github.com/alibaba/lowcode-engine/issues/416)

## 1.0.1

- 修正和 ext 的联动
- 依赖项目使用正式版的引擎

## 1.0.0

- 发布如下变更点

## 1.0.0-beta.2

- 修改打包配置，正确引入 js-beautify

## 1.0.0-beta.1

- 修改打包配置，避免如下 ESM 兼容性 bug

```bash
error  in ./node_modules/_@ampproject_remapping@2.1.0@@ampproject/remapping/dist/remapping.mjs
Can't import the named export 'presortedDecodedMap' from non EcmaScript module (only default export is available)
```

## 1.0.0-beta.0

- 针对引擎 2.0 版本进行适配

## 0.5.2-beta.0

- 在函数内使用 object rest 语法将不再导致函数被清空，此外，Chrome 80 前支持的语法，都不再经过 babel 编译。

## 0.5.1

发布下述（0.4.2-beta.2～0.5.1-beta.8）所有变更点。

## 0.5.1-beta.8

- 增强容错
- 在引擎加载 meta 期间，禁用源码面板，避免出错

## 0.5.1-beta.7

- 升级到 `@alilc/lowcode-plugin-base-monaco-editor` 0.1.0-beta.13

## 0.5.1-beta.6

- React JSX 语法不再触发语法报错
- 每次打开插件面板时，都重新读取 schema
- 不再生成局部的原代码 `lifeCycles[any].originalCode`、`methods[any].originalCode`、`state[any].originCode`，使用跟他们平级的全局 `originCode`

## 0.5.1-beta.5

- 使用驻留时间更短的（1s）的 Schema 保存提示
- 生成的 schema state 不再保留 trailing semicolon

## 0.5.1-beta.4

- 修正触发的事件对应 bug

## 0.5.1-beta.3

- 和 lowcode-engine-ext 1.0.19 搭配，触发事件优化为 `codeEditor.focusByFunction` 和 `codeEditor.focusByFunction`

## 0.5.1-beta.2

- 支持函数参数解构语法 `function a({ b }) {}`

## 0.5.1-beta.1

- 修正插入 js function 的位置
- 修正触发 open by function 的位置
- 文件出现异常时，标签页也提示异常

![](https://img.alicdn.com/imgextra/i3/O1CN017Jibhw1qaXqfTWYpw_!!6000000005512-2-tps-2372-1542.png)

## 0.5.1-beta.0

- 参考 VSCode，显式在 tab 上展现用户是否已编辑此文件的状态
- 保存 Schema 将展现显式提示，构建用户“关闭 - 保存”的心智
- 允许在编辑到一半的时候保存文件，而无需通过关闭面板
- 优化异常展现，现在 babel 异常和 ts 解析异常的形式是一致的了
- 保存 CSS 后，将自动更新为格式化后的版本
- 修复多次打开/关闭选项卡时，出现多个异常提示的问题

## 0.5.0-beta.6

- 不再提示 ts 的优化性内容，避免引导用户输入错误代码
- babel 编译异常直接提示在文本编辑中，避免来回查找异常内容

![](https://img.alicdn.com/imgextra/i3/O1CN01aEB25S1CPTeG5Qk54_!!6000000000073-2-tps-1196-1544.png)

- 退出时如果出现异常，将再次打开代码编辑器

## 0.5.0-beta.5

- 正确引入代码编辑器样式
- 对代码的提示不再强制

## 0.5.0-beta.3

- 能够提示 Component 的内容了
- 代码能正常提示不受外界的 `MonacoEnvironment.getWorkerUrl` 定制而影响了

## 0.5.0-beta.2

- 不再编译 `async await`，避免运行时依赖
- 在生命周期方法中调用 `async await` 自执行函数不再报错，如

```javascript
  componentDidMount() {
    (async() => {
      console.log(await new Promise((resolve) => resolve(1)))
    })();
  }
```

- Babel 编译过程中如果出现异常，将显式报错

## 0.5.0-beta.1

- Class function 中声明 `fn(...args) {}` 被编译为 `fn(......args)` 的问题得到了解决
- Class function 中声明 `async fn() {}` 被编译为 `''` 的问题得到了解决。[see](http://gitlab.alibaba-inc.com/ali-lowcode/ali-lowcode-engine/issues/113323)

## 0.5.0-beta.0

- 内部依赖的 @alilc/lowcode-plugin-base-monaco-editor 升级到 0.1.0-beta.2，已支持 `?.` 等形态的语法

## 0.4.2-beta.2

- chore: 使本地模拟环境能正常运转
- 保存时报错不再 crash 编辑器，而是提示用户修改代码，[see](http://gitlab.alibaba-inc.com/ali-lowcode/ali-lowcode-engine/issues/112997)
- 函数表达式支持 rest 操作符，[see](http://gitlab.alibaba-inc.com/ali-lowcode/ali-lowcode-engine/issues/112997)
- 修正 CSS 面板的样式可能被外界 CSS 影响而导致展示不出来的问题，[see](http://gitlab.alibaba-inc.com/ali-lowcode/ali-lowcode-engine/issues/111955)
- 优化入口 functional component 函数书写
- 优化内部类型
- 如果打开了 code-editor 后没有打开 css 面板，不再清空 schema 里的 css 字段。[see](http://gitlab.alibaba-inc.com/ali-lowcode/ali-lowcode-engine/issues/113217)
- 异常报错不遮挡代码书写区域，[see](http://gitlab.alibaba-inc.com/ali-lowcode/ali-lowcode-engine/issues/112999)

diff [1](https://code.aone.alibaba-inc.com/ali-lowcode/lowcode-plugins/codereview/7430858) [2](https://code.aone.alibaba-inc.com/ali-lowcode/lowcode-plugins/codereview/7428700)
