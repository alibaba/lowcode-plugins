# lowcode-plugin-@alilc/lowcode-plugin-schema [![][npm-image]][npm-url]

show lowcode schema
查看低代码引擎 schema

---

## 使用

### 注册插件
#### 展示页面级 schema
```jsx
import { plugins } from '@alilc/lowcode-engine';
import LowcodePluginAliLowcodePluginSchema from '@alilc/lowcode-plugin-schema';

// 注册到引擎
plugins.register(LowcodePluginAliLowcodePluginSchema);
```
#### 展示项目级 schema
```jsx
import { plugins } from '@alilc/lowcode-engine';
import LowcodePluginAliLowcodePluginSchema from '@alilc/lowcode-plugin-schema';

// 注册到引擎
plugins.register(LowcodePluginAliLowcodePluginSchema, { isProjectSchema: true });
```

### 插件属性 & 方法

#### isProjectSchema
- description: '是否是项目级 schema'
- type: 'boolean'
- default: false

### 依赖插件
暂无
