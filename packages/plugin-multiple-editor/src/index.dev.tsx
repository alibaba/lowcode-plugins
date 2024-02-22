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
import { EditorPluginInterface, Service } from './Service';
import { PrettierPlugin } from './plugins/prettier-plugin';

controller.updateMeta({ singleton: true });

(async () => {
  console.log((await getMonaco()) === (await getMonaco()));
})();

class TestPlugin implements EditorPluginInterface {
  apply(service: Service): void {
    service.registerAction({
      icon: (
        <img
          src="https://gw.alicdn.com/imgextra/i1/O1CN019CCwKb1s2lrE9EUp7_!!6000000005709-0-tps-750-720.jpg"
          alt="111"
        />
      ),
      key: 'hello',
      action() {
        alert('111');
      },
      title: '111',
      priority: 0,
    });
  }
}

async function initEditor(el: any) {
  await registerAllPlugin();
  await plugins.register(
    codePlugin({
      softSave: true,
      useLess: true,
      // mode: 'single',
      es6: true,
      defaultFiles: {
        'aspect.js': 'export default {}',
        'utils/index.js': 'xxx',
        'utils/u.js': 'xxx',
        'config/life/index.js': 'xxx',
        'config/life/a.js': 'xxx',
        'util.js': '',
      },
      plugins: [
        new SearchPlugin({
          onGotoRef: (name) => {
            console.log(name);
          },
        }),
        new TestPlugin(),
        new PrettierPlugin(),
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
          // console.log('value change', v);
        });

        setTimeout(() => {
          controller.addFiles({
            'extends/index.js': 'console.log(1)',
            'extends/util.js': 'console.log(2)',
          });
        }, 3000);
      },
    }) as any
  );
  await init(el, {
    locale: 'zh-CN',
    enableCondition: true,
    enableCanvasLock: true,
    // 默认绑定变量
    supportVariableGlobally: true,
  } as any);
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
