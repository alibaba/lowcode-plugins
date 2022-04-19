## Ali Lowcode Engine 插件

### 安装依赖

项目的 lerna 配置有问题，先不要在根目录 `npm i`，请进入 `packages/*` 执行 `npm i`。

### 本地启动

进入 `packages/*` 并执行 `npm run start`。

### 本地编译

进入 `packages/*` 并执行 `npm run build`。

### 发版

需要先获得 `@alilc` 的 npm 权限，并执行 `npm login` 成功。

修改版本号，进入 `packages/*` 并执行 `npm publish`。

## 插件列表

- base-monaco-editor
- plugin-code-editor
- plugin-schema
- plugin-undo-redo
- plugin-zh-cn
- plugin-block
- action-block
