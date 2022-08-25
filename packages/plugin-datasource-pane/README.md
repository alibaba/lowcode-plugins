## 低代码引擎 - 数据源面板插件

配置页面的数据源。

一个 pluginProps 的例子

```
{
  importPlugins: [],
  exportPlugins: [],
  formComponents: {},
  tagSelector: () => {},
  dataSourceTypes: [
    {
      type: 'mopen',
      schema: {
        type: 'object',
        properties: {
          options: {
            type: 'object',
            properties: {
              uri: {
                title: 'api',
              },
              v: {
                title: 'v',
                type: 'string',
              },
              appKey: {
                title: 'appKey',
                type: 'string',
              },
            },
          },
        },
      },
    },
  ],
}
```

使用预置的数据源类型

```
import {
  DataSourceTypeFetch,
  DataSourceTypeJsonp,
  DataSourceTypeMtop,
} from '@alilc/lowcode-plugin-datasource-pane';
```

## 如何定制

## 定制数据源类型

### 类型定义

内置 fetch，mtop，jsonp 类型，支持传入自定义类型。

```
type DataSourceType = {
  type: string;
  optionsSchema: JSONSchema6
};
```

数据源类型需要在集团规范约束下扩展。目前只允许在 options 下添加扩展字段。

比如 mtop 类型，需要添加 options.v （版本）字段。

### formily 组件

### 下钻

## 定制数据源信息展示标签

通过 renderDataSourceInfoTags 方法控制数据源的信息展示

```
(dataSourceConfig) => {
  if (dataSourceConfig.type = 'fetch') {
    return [{
      type: 'primary',
      content: dataSourceConfig.type
    }];
  }
}
```

## 定制导入插件

### 导入组件示例

导入组件引入方式参考 pluginProps 
```
import { DataSourceImportPluginTest } from './DataSourceImportPluginTest';

{
  ...
    importPlugins: [
        {
            name: '这里可以导入',
            title: '这里可以导入',
            component: DataSourceImportPluginTest,
            componentProps: {
                onImport: (res) => {
                    console.log('ceshi ')

                },
                onCancel: () => {
                    console.log('ceshi2 ')

                }
            }
        }
    ],
        exportPlugins: [],
            formComponents: { },
  ...
}

// DataSourceImportPluginTest.jsx

/**
 * 源码导入插件
 * @todo editor 关联 types，并提供详细的出错信息
 */
import React, { PureComponent } from 'react';
import { Button } from '@alifd/next';
import _noop from 'lodash/noop';
import _isArray from 'lodash/isArray';
import _last from 'lodash/last';
import _isPlainObject from 'lodash/isPlainObject';
import { RuntimeDataSourceConfig as DataSourceConfig } from '@alilc/lowcode-datasource-types';
import { JSONSchema6 } from 'json-schema';
import type { ComponentType } from 'react';
export interface DataSourceType {
    type: string;
    schema: JSONSchema6;
    plugin?: ComponentType;
}
export interface DataSourcePaneImportPluginComponentProps {
    dataSourceTypes: DataSourceType[];
    onImport?: (dataSourceList: DataSourceConfig[]) => void;
    onCancel?: () => void;
}
export interface DataSourceImportPluginCodeProps
    extends DataSourcePaneImportPluginComponentProps {
    defaultValue?: DataSourceConfig[];
}
export interface DataSourceImportPluginCodeState {
    code: string;
    isCodeValid: boolean;
}
export class DataSourceImportPluginCode extends PureComponent<
    DataSourceImportPluginCodeProps,
    DataSourceImportPluginCodeState
> {
    handleComplete = () => {
        console.log('确认')
    };
    onCancel = () => {
        console.log('取消')
    };
    render() {
        return (
            <div className="lowcode-plugin-datasource-import-plugin-code">
                此处代码可以自定义
                <p className="btns">
                    <Button onClick={this.onCancel}>取消</Button>
                    <Button type="primary" onClick={this.handleComplete}>
                        确认
                    </Button>
                </p>
            </div>
        );
    }
}

```

具体的 component 可参考 DataSourceImportPluginCode
 [查看](https://github.com/alibaba/lowcode-plugins/blob/main/packages/plugin-datasource-pane/src/components/DataSourceImportPluginCode/DataSourceImportPluginCode.tsx)

 demo 截图
 ![Alt](https://user-images.githubusercontent.com/14235113/186659341-dff511e8-f032-423c-8be7-e0cc281f3964.png)




## 定制导出插件

WIP

# 事件钩子

# 依赖

* formily v2
* xstate
* manaco
* react-dnd


# 和之前版本的区别

* 支持导出并自定义导出插件
* 支持排序
* 支持信息标签
* 体验更好的对象参数编辑
* 支持字段配置表达式

# 贡献代码

欢迎提 MR

# 未来计划

* 详情页下钻
* 支持多语言处理
* 单元测试


# 参考

* [搭建协议规范](https://lowcode-engine.cn/lowcode)