import { OutlinePane } from './views/pane';
import { OutlineBackupPane } from './views/backup-pane';
import { IconOutline } from './icons/outline';
import { intlNode } from './locale';
import { getTreeMaster } from './tree-master';

import { ILowCodePluginContext, config, common } from '@alilc/lowcode-engine';
const { designerCabin } = common;
const { dragon } = designerCabin;

const plugin = (ctx: ILowCodePluginContext, options: any) => {
  return {
    name: 'outline-pane',
    // 插件的初始化函数，在引擎初始化之后会立刻调用
    init() {
      const { skeleton } = ctx;
      skeleton.add({
        area: 'leftArea',
        name: 'outline-pane',
        type: 'PanelDock',
        props: {
          icon: IconOutline,
          description: intlNode('Outline Tree'),
        },
        content: OutlinePane,
        panelProps: {
          // TODO: support isInFloatArea
          // area: isInFloatArea ? 'leftFloatArea' : 'leftFixedArea',
          keepVisibleWhileDragging: true,
          ...config.get('defaultOutlinePaneProps'),
        },
      });
      skeleton.add({
        area: 'rightArea',
        name: 'backupOutline',
        type: 'Panel',
        props: {
          condition: () => {
            // TODO:
            return dragon.dragging && !getTreeMaster().hasVisibleTreeBoard();
            // return dragon.dragging;
          },
        },
        content: OutlineBackupPane,
      });
    },
  };
};

plugin.pluginName = 'outline-pane';
// plugin.meta = {
//   engines: {
//     lowcodeEngine: '^1.0.0'
//   }
// };

export default plugin;