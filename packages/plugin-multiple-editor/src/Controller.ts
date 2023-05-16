import type { Project, Event } from '@alilc/lowcode-shell';
import { skeleton, common } from '@alilc/lowcode-engine';
import {
  beautifyCSS,
  compatGetSourceCodeMap,
  getConstructorContent,
  getDefaultDeclaration,
  getInitFuncContent,
  lintIndex,
  treeToMap,
} from './utils';
import { FunctionEventParams, Monaco, ObjectType } from './types';
import type { editor } from 'monaco-editor';
import {
  addFunction,
  focusByFunctionName,
  focusCodeByContent,
  getDefaultFileList,
} from './MultipleFileEditor/util';
import { EditorContextType } from './Context';
import { Message } from '@alifd/next';
import { getMethods } from './utils/get-methods';
import { EditorHook, HookKeys } from './EditorHook';
import { Service } from './Service';

export * from './EditorHook';

export interface EditorControllerState {
  declarationsMap: Record<string, string>;
  extraLibs: Array<{ path: string; content: string }>;
}

export type HookHandleFn<T = any> = (fn: T) => () => void;

export interface CodeTemp {
  css: any;
  methods: any;
  state: any;
  lifeCycles: any;
  _sourceCodeMap: { files: ObjectType; meta: any };
}

export class EditorController extends EditorHook {
  editor!: Event;

  project!: Project;

  es6?: boolean;

  defaultFiles: ObjectType<string>;

  monaco?: Monaco;

  private codeTemp?: CodeTemp;

  private listeners: any[];

  private extraLibMap: Map<string, string>;

  private state: EditorControllerState;

  codeEditor?: editor.IStandaloneCodeEditor;

  private codeEditorCtx?: EditorContextType;

  service!: Service;

  onImportSchema: HookHandleFn<(schema: any) => void | Promise<void>> =
    this.hookFactory(HookKeys.onImport);

  onSourceCodeChange: HookHandleFn<(code: any) => void> = this.hookFactory(
    HookKeys.onSourceCodeChange
  );

  onEditCodeChange: HookHandleFn<
    (code: { content: string; file: string }) => void
  > = this.hookFactory(HookKeys.onEditCodeChange);

  constructor() {
    super();
    this.state = {
      declarationsMap: {},
      extraLibs: [],
    };
    this.listeners = [];
    this.defaultFiles = {};
    this.extraLibMap = new Map();
  }

  init(project: Project, editor: Event, service: Service) {
    this.project = project;
    this.editor = editor;
    this.service = service;
    this.setupEventListeners();
    this.initCodeTempBySchema(this.getSchema(true));
    this.triggerHook(HookKeys.onImport, this.getSchema(true));
  }

  initCodeEditor(
    codeEditor: editor.IStandaloneCodeEditor,
    ctx: EditorContextType
  ) {
    this.codeEditor = codeEditor;
    this.codeEditorCtx = ctx;
  }

  setCodeTemp(code: any | ((old: CodeTemp) => CodeTemp)) {
    if (typeof code === 'function') {
      this.codeTemp = code(this.codeTemp);
    } else {
      this.codeTemp = code;
    }
  }

  getCodeTemp(): CodeTemp | undefined {
    return this.codeTemp;
  }

  addComponentDeclaration(key: string, declaration: string) {
    this.state.declarationsMap[key] = declaration;
    this.publish();
    this.applyLibs();
  }

  addComponentDeclarations(list: Array<[string, string]> = []) {
    for (const [key, dec] of list) {
      this.state.declarationsMap[key] = dec;
    }
    this.publish();
    this.applyLibs();
  }

  private publishExtraLib() {
    const libs: Array<{ path: string; content: string }> = [];
    this.extraLibMap.forEach((content, path) => libs.push({ content, path }));
    this.state.extraLibs = libs;
    this.publish();
  }

  addExtraLib(content: string, path: string) {
    this.extraLibMap.set(path, content);
    this.applyLibs();
    this.publishExtraLib();
  }

  removeExtraLib(path: string) {
    this.extraLibMap.delete(path);
    this.applyLibs();
    this.publishExtraLib();
  }

  private async applyLibs() {
    if (!this.monaco) {
      const { getMonaco } = await import(
        '@alilc/lowcode-plugin-base-monaco-editor'
      );
      this.monaco = await getMonaco(undefined) as any;
    }
    const decStr = Object.keys(this.state.declarationsMap).reduce(
      (v, k) => `${v}\n${k}: ${this.state.declarationsMap[k]};\n`,
      ''
    );
    const { content, path } = getDefaultDeclaration(decStr);
    this.monaco?.languages.typescript.javascriptDefaults.addExtraLib(
      content,
      path
    );
    this.extraLibMap.forEach((value, key) => {
      this.monaco?.languages.typescript.javascriptDefaults.addExtraLib(
        value,
        key
      );
    });
  }

  getSchema(pure?: boolean): any {
    const schema = this.project.exportSchema(
      common.designerCabin.TransformStage.Save
    );
    // 导出的时候重新编译一下，避免没有打开编辑器的时候直接保存值没有编译代码的情况
    const fileMap = this.codeEditorCtx?.fileTree
      ? treeToMap(this.codeEditorCtx.fileTree)
      : this.codeTemp?._sourceCodeMap.files; // 获取最新的fileMap
    if (fileMap && !pure) {
      if (!this.compileSourceCode(fileMap)) {
        throw new Error('编译失败');
      }
      Object.assign(schema.componentsTree[0], this.codeTemp);
    }
    return schema;
  }

  importSchema(schema: any) {
    this.project.importSchema(schema);
    this.initCodeTempBySchema(schema);
    this.triggerHook(HookKeys.onImport, schema);
    // 文件树发生改变
    this.triggerHook(
      HookKeys.onSourceCodeChange,
      (schema as any).componentsTree[0]?._sourceCodeMap
    );
  }

  publish(state?: any) {
    this.state = {
      ...this.state,
      ...state,
    };
    this.listeners.forEach((l) => l(this.state));
  }

  subscribe(fn: (state: EditorControllerState) => any) {
    this.listeners.push(fn);
    fn(this.state);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  initCodeTempBySchema(schema: any) {
    const componentSchema = schema.componentsTree[0] || {};
    const { css, methods, state, lifeCycles } = componentSchema;
    const codeMap = (componentSchema as any)._sourceCodeMap;
    const defaultFileMap = {
      ...this.defaultFiles,
      ...getDefaultFileList(schema),
    };
    const compatMap = compatGetSourceCodeMap(codeMap);
    this.codeTemp = {
      css,
      methods,
      state,
      lifeCycles,
      _sourceCodeMap: {
        ...compatMap,
        files: defaultFileMap,
      },
    };
  }

  private setupEventListeners() {
    this.editor?.on('common:codeEditor.focusByFunction', ((
      params: FunctionEventParams
    ) => {
      setTimeout(() => {
        this.codeEditorCtx?.selectFile('index.js', []);
        if (this.monaco && this.codeEditor) {
          focusByFunctionName(this.codeEditor, params, this.monaco);
        }
      }, 100);
    }) as any);

    this.editor?.on('common:codeEditor.addFunction', ((
      params: FunctionEventParams
    ) => {
      setTimeout(() => {
        this.codeEditorCtx?.selectFile('index.js', []);
        if (this.monaco && this.codeEditor) {
          addFunction(this.codeEditor, params, this.monaco);
        }
      }, 100);
    }) as any);
  }

  focusCodeByPosition(file: string, pos: { line: number; col?: number }) {
    skeleton.showPanel('codeEditor');
    setTimeout(() => {
      this.codeEditorCtx?.selectFileByName(file);
      setTimeout(() => {
        if (this.codeEditor) {
          this.codeEditor.revealLineInCenter(pos.line);
          this.codeEditor.setPosition({
            column: pos.col || 0,
            lineNumber: pos.line,
          });
          this.codeEditor.focus();
        }
      }, 100);
    }, 100);
  }

  focusCode(file: string, content: string) {
    skeleton.showPanel('codeEditor');
    setTimeout(() => {
      this.codeEditorCtx?.selectFileByName(file);
      if (this.codeEditor && this.monaco) {
        focusCodeByContent(this.codeEditor, this.monaco, content);
      }
    }, 100);
  }

  // 编译并保存源码
  compileSourceCode(fileMap: any, softSave = true) {
    const { valid, validMsg } = lintIndex(fileMap['index.js']);
    if (!valid) {
      Message.error(validMsg);
      return false;
    }
    const { methods, lifeCycles, state } = getMethods(fileMap['index.js']);
    const schema = this.getSchema(true);
    const pageNode: any = {};
    pageNode._sourceCodeMap = {
      files: fileMap,
      meta: this.getCodeTemp()?._sourceCodeMap?.meta || {},
    };
    pageNode.state = state;
    pageNode.methods = methods;
    pageNode.lifeCycles = lifeCycles;
    pageNode.css = beautifyCSS(fileMap['index.css'] || '', {});
    if (lifeCycles.constructor === {}.constructor) {
      lifeCycles.constructor = {
        originalCode: 'function constructor() { }',
        type: 'JSFunction',
        value: 'function constructor() { }',
      } as any;
    }
    // 编译工具函数
    (lifeCycles as any).constructor.value = getConstructorContent(
      (lifeCycles.constructor as any).value as any
    );
    pageNode.methods.__initExtra = {
      type: 'JSFunction',
      value: getInitFuncContent(fileMap, this.es6),
    };
    if (softSave) {
      (window as any).__lowcode__source__code__ = {
        css: pageNode.css,
        methods: pageNode.methods,
        state: pageNode.state,
        lifeCycles: pageNode.lifeCycles,
        _sourceCodeMap: pageNode._sourceCodeMap,
      };
      this.setCodeTemp((window as any).__lowcode__source__code__);
    } else {
      if (schema.componentsTree[0]) {
        Object.assign(schema.componentsTree[0], pageNode);
      }
      this.project.importSchema(schema);
      Message.success('保存成功');
    }
    return true;
  }

  resetSaveStatus() {
    this.codeEditorCtx?.updateState({ modifiedKeys: [] });
  }

  triggerHook(key: HookKeys, ...args: any[]): void {
    super.triggerHook(key, ...args);
  }
}

export const editorController = new EditorController();
