import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import {
  controller,
  getMonaco,
} from '@alilc/lowcode-plugin-base-monaco-editor';
import { init, plugins } from '@alilc/lowcode-engine';
import './index.dev.less';
import codePlugin from './index';
import { EditorController } from './Controller';
import registerAllPlugin from './dev-config/universal/plugin';
import { SearchPlugin } from './plugins/search-plugin';

controller.updateMeta({ singleton: true });

(async () => {
  console.log((await getMonaco()) === (await getMonaco()));
})();

async function initEditor(el: any) {
  await registerAllPlugin();
  await plugins.register(
    codePlugin({
      softSave: true,
      // mode: 'single',
      es6: true,
      defaultFiles: {
        'aspect.js': 'export default {}',
      },
      plugins: [
        new SearchPlugin({
          onGotoRef: (name) => {
            console.log(name);
          },
        }),
      ],
      onInstall(controller: EditorController) {
        (window as any).codeEditorController = controller;
        controller.addExtraLib(
          `
        declare interface Ctx<T = any> {
          getState(): T;
          setState(state: Partial<T>, callback?: () => {}): void;
          util: any;
        }
        declare interface InsPlugin<T = any> {
          (ctx: Ctx<T>): any;
        }
    `,
          'ts:plugin.d.ts'
        );

        setTimeout(() => {
          controller.addExtraLib(
            `
          declare module globalThis {
            var state: {name: string;}
          }
      `,
            'ts:global.d.ts'
          );
        }, 1000);

        controller.onEditCodeChange((v) => {
          console.log('value change', v);
        });
      },
    })
  );
  await init(el, {
    locale: 'zh-CN',
    enableCondition: true,
    enableCanvasLock: true,
    // 默认绑定变量
    supportVariableGlobally: true,
  });
}

const LowcodeRender = () => {
  const ref = useRef();
  useEffect(() => {
    initEditor(ref.current);
  }, []);
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ width: '100%', height: '100%' }} ref={ref as any} />
    </div>
  );
};

ReactDOM.render(<LowcodeRender />, document.getElementById('root'));
