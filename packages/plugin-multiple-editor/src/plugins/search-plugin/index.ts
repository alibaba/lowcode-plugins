import { EditorPluginInterface, Service } from '@/Service';
import type editor from 'monaco-editor';
import { findEditorMatch } from './util';
import { getAllMethodFromSchema } from './search';

type Methods = Record<string, { count: number | string }>;

export class SearchPlugin implements EditorPluginInterface {
  /**
   * 是否已经获取过搜索结果
   * 出于性能考虑，只初始化一次
   */
  private gotSearch?: boolean;

  private service!: Service;

  dispose?: editor.IDisposable;

  command?: string | null | undefined;

  codeLens: editor.languages.CodeLens[] = [];

  methods: Methods;

  constructor(
    private options?: {
      onGotoRef?: (methodName: string) => void;
      onGotMethods?: () => Methods;
      onActive?: () => void;
      onDeActive?: () => void;
    }
  ) {
    this.methods = {};
  }

  apply(service: Service): void {
    this.service = service;
    service.onActive(() => {
      // this.gotSearch = false;
      // 搜索比较耗性能，每次只在打开面板的时候搜一次
      this.methods = this.options?.onGotMethods?.() || getAllMethodFromSchema();
      this.service.controller.codeEditor?.focus();
    });
    service.onDeActive(() => {
      // this.dispose?.dispose();
    });
    service.onSelectFileChange(
      ({ filepath, content }: { filepath: string; content: string }) => {
        // 只需要初始化一次
        if (
          filepath.replace(/^\//, '') === 'index.js' &&
          content &&
          !this.gotSearch
        ) {
          this.gotSearch = true;
          setTimeout(() => {
            this.initCodelens();
          }, 500);
        }
      }
    );
  }

  private initCodelens() {
    const { monaco, codeEditor } = this.service.controller;
    // 只需要一个command，根据函数名执行回调即可
    if (!this.command) {
      this.command = codeEditor?.addCommand(
        0,
        (_, funcName) => {
          this.options?.onGotoRef?.(funcName);
        },
        ''
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;

    this.dispose = monaco?.languages.registerCodeLensProvider('javascript', {
      provideCodeLenses(model, token) {
        const isIndex: boolean = model.uri.path === '/index.js';
        if (isIndex) {
          const content = model.getValue();
          _this.getLensList(content, model);
        }
        return {
          lenses: isIndex ? _this.codeLens : [],
          dispose: () => void 0,
        } as editor.languages.ProviderResult<editor.languages.CodeLensList>;
      },
    });
  }

  private getLensList(
    code: string,
    model: editor.editor.ITextModel
  ): editor.languages.CodeLens[] {
    const ret: editor.languages.CodeLens[] = [];
    try {
      // const methods =
      //   this.options?.onGotMethods?.() || getMethods(code).methods;
      const { methods } = this;
      const methodNames = Object.keys(methods);
      for (const method of methodNames) {
        const matchRes = findEditorMatch(model, method);
        const { startColumn, startLineNumber } = matchRes?.range || {};
        if (startLineNumber && methods[method].count) {
          ret.push({
            id: method,
            range: {
              startLineNumber: startLineNumber,
              endLineNumber: startLineNumber,
              startColumn: startColumn || 0,
              endColumn: startColumn || 0,
            },
            command: {
              id: this.command || 'no-command',
              title: `共有${methods[method].count}处引用`,
              arguments: [method],
            },
          });
        }
      }
      this.codeLens = ret;
    } catch (error) {
      // nothing
      console.warn(error);
    }

    return ret;
  }
}
