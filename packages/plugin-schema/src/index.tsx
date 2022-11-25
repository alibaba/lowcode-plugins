import * as React from 'react';
import { ILowCodePluginContext } from '@alilc/lowcode-engine';
import PluginSchema from './editor';

const plugin = (ctx: ILowCodePluginContext, options: any) => {
  return {
    // 插件的初始化函数，在引擎初始化之后会立刻调用
    init() {
      const isProjectSchema = (options && options['isProjectSchema']) === true;

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
            showProjectSchema={isProjectSchema}
          />
        ),
      })
    },
  };
};

plugin.pluginName = 'LowcodePluginAliLowcodePluginSchema';
plugin.meta = {
  preferenceDeclaration: {
    title: 'schema 面板配置',
    properties: [
      {
        key: 'isProjectSchema',
        type: 'boolean',
        description: '是否是项目级 schema',
        default: false,
      },
    ],
  },
};

export default plugin;
