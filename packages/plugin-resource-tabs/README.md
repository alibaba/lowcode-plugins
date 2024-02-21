# @alilc/lowcode-plugin-resource-tabs [![][npm-image]][npm-url]


---

## 使用

### 注册插件
```jsx
import { plugins } from '@alilc/lowcode-engine';
import PluginResourceTabs from '@alilc/lowcode-plugin-resource-tabs';

// 注册到引擎
plugins.register(PluginResourceTabs);
```

### 插件属性 & 方法

#### appKey
- description: '唯一标识，用于缓存应用 Tab'
- type: 'string'

### tabClassName
- description: 'Tab className'

### shape
- type: 'string',
- description: 'Tab shape'

### onSort
- type: 'function',
- description: 'tabs sort function',

### 依赖插件

该插件依赖以下插件：

| 插件名 | 包名 |
| --- | --- |
