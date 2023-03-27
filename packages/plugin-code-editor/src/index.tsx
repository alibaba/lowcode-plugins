import { CodeEditorPane } from './pane';
import { project, ILowCodePluginContext } from '@alilc/lowcode-engine';
import icon from './icon';

const plugin = (ctx: ILowCodePluginContext) => {
  return {
    name: 'codeEditor',
    width: 600,
    // 依赖的插件（插件名数组）
    dep: [],
    // 插件对外暴露的数据和方法
    exports() {
      return {};
    },
    // 插件的初始化函数，在引擎初始化之后会立刻调用
    init() {
      const codeEditorDock = ctx.skeleton.add({
        area: 'leftArea',
        name: 'codeEditor',
        type: 'PanelDock',
        props: {
          icon,
          description: '源码面板',
        },
        panelProps: {
          width: '600px',
          title: '源码面板',
        },
        content: (
          <CodeEditorPane
            event={ctx.event}
            skeleton={ctx.skeleton}
            project={ctx.project}
          />
        ),
      });

      codeEditorDock && codeEditorDock.disable();
      project.onSimulatorRendererReady(() => {
        codeEditorDock.enable();
      });
    },
  };
};

plugin.pluginName = 'codeEditor';

export default plugin;
