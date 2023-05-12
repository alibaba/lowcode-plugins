import React, { PureComponent } from 'react';
import BaseMonacoEditor from '@alilc/lowcode-plugin-base-monaco-editor';
import type { editor } from 'monaco-editor';
import './index.css';
import { Monaco } from '../../types';

export interface MonacoEditorProps {
  theme?: string;
  isFullscreen?: boolean;
  value?: string;
  language?: 'javascript' | 'css' | 'json';
  onChange?: (value: string) => void;
  filePath?: string;
  onGotoFile?: (filename: string) => void;
  onEditorMount?: (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => void;
}

class MonacoEditor extends PureComponent<MonacoEditorProps> {
  ref: HTMLDivElement | null = null;

  editor?: editor.IStandaloneCodeEditor;

  monaco?: Monaco;

  viewStatusMap: Record<string, any> = {};

  private handleResize = () => {
    this.editor?.layout();
  };

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  componentDidUpdate(prevProps: MonacoEditorProps) {
    if (prevProps.theme !== this.props.theme) {
      this.editor?.updateOptions({ theme: this.props.theme });
    }
    // 恢复上个文件的编辑状态（鼠标位置、选择等）
    if (prevProps.filePath !== this.props.filePath) {
      this.editor?.focus();
      requestAnimationFrame(() => {
        this.editor?.restoreViewState(
          this.viewStatusMap[this.props.filePath || '']
        );
      });
    }
    if (prevProps.isFullscreen !== this.props.isFullscreen) {
      this.editor?.updateOptions({
        minimap: { enabled: this.props.isFullscreen },
      });
    }
    // base editor 的bug，value 改变编辑器不会更新，暂时这么解决
    if (
      this.props.value !== prevProps.value &&
      this.props.filePath === prevProps.filePath
    ) {
      this.editor?.getModel()?.setValue(this.props.value || '');
    }
  }

  initMonaco = () => {
    const { monaco, editor: editorInstance } = this;
    if (!monaco || !editorInstance) {
      return;
    }
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      noSuggestionDiagnostics: false,
    });

    // compiler options
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      module: monaco.languages.typescript.ModuleKind.ES2015,
      allowJs: true,
      allowNonTsExtensions: true,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
    });

    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    const editorService = (editorInstance as any)._codeEditorService;
    const openEditorBase = editorService.openCodeEditor.bind(editorService);
    editorService.openCodeEditor = async (input: any, source: any) => {
      const result = await openEditorBase(input, source);
      if (result === null) {
        this.props.onGotoFile?.(input.resource?.path);
        // console.log('Open definition for:', input);
        // console.log(
        //   'Corresponding model:',
        //   monaco.editor.getModel(input.resource)
        // );
      }
      return result; // always return the base result
    };
    window.addEventListener('resize', this.handleResize);
  };

  handleEditorMount = (
    monaco: Monaco,
    editorInstance: editor.IStandaloneCodeEditor
  ) => {
    this.monaco = monaco;
    this.editor = editorInstance;
    this.initMonaco();
    this.props.onEditorMount?.(editorInstance, monaco);
    // blur 时记录下当前的编辑状态
    editorInstance.onDidBlurEditorWidget(() => {
      this.viewStatusMap[this.props.filePath || ''] =
        editorInstance.saveViewState();
    });
  };

  render() {
    const { onChange, filePath, language, value } = this.props;
    return (
      <div className="i-monaco-editor-container">
        <BaseMonacoEditor
          onChange={onChange}
          path={filePath}
          editorDidMount={this.handleEditorMount as any}
          language={language}
          value={value}
          className="i-monaco-editor"
          height="100%"
        />
      </div>
    );
  }
}

export default MonacoEditor;
