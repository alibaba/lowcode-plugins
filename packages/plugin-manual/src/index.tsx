import * as React from 'react';
import { ILowCodePluginContext } from '@alilc/lowcode-engine';
import { IconQuestion } from './icon';
import { Dialog } from '@alifd/next';
import { Documents } from './popup';

const PluginManual = (ctx: ILowCodePluginContext) => {
  return {
    // 插件名，注册环境下唯一
    name: 'PluginManual',
    // 依赖的插件（插件名数组）
    dep: [],
    // 插件对外暴露的数据和方法
    exports() {
      return { }
    },
    // 插件的初始化函数，在引擎初始化之后会立刻调用
    init() {
      // 往引擎增加面板
      ctx.skeleton.add({
        area: 'leftArea',
        name: 'demoPane',
        type: 'PanelDock',
        props: {
          align: 'bottom',
          icon: IconQuestion,
          description: '如何使用',
          onClick() {
            Dialog.show({
              title: '低代码产品使用文档',
              content: (
                <Documents />
              ),
              height: window.innerHeight - 100 + 'px',
              style: {
                width: window.innerWidth - 300,
              },
              footer: false,
            })
          },
        },
      });
    },
  };
};

PluginManual.pluginName = 'PluginManual';

export default PluginManual;
