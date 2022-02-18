import * as React from 'react';
import { ILowCodePluginContext } from '@alilc/lowcode-engine';
import PluginSchema from './editor';

const plugin = (ctx: ILowCodePluginContext) => {
  return {
    // 插件名，注册环境下唯一
    name: 'LowcodePluginAliLowcodePluginSchema',
    // 依赖的插件（插件名数组）
    dep: [],
    // 插件的初始化函数，在引擎初始化之后会立刻调用
    init() {
      // 往引擎增加面板
      ctx.skeleton.add({
        area: 'leftArea',
        name: 'LowcodePluginAliLowcodePluginSchema',
        type: 'PanelDock',
        props: {
          align: 'bottom',
          icon: 'ellipsis',
          description: 'Schema',
        },
        panelProps: {
          width: 'calc(100% - 50px)',
        },
        content: () => (
          <PluginSchema
            project={ctx.project}
            skeleton={ctx.skeleton}
            event={ctx.event}
          />
        ),
      })
    },
  };
};

plugin.pluginName = 'LowcodePluginAliLowcodePluginSchema'

export default plugin
