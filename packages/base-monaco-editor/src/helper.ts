/* eslint-disable no-empty */
import { useEffect, useState, useRef, CSSProperties } from 'react';
import loader from '@monaco-editor/loader';

loader.config({
  paths: {
    vs: 'https://g.alicdn.com/code/lib/monaco-editor/0.31.1/min/vs',
  },
});

type IAmbigousFn = (...args: any[]) => any;

// @todo fill type def for monaco editor without refering monaco editor
/**
 * @see https://microsoft.github.io/monaco-editor/api/index.html
 */
export interface IEditorInstance {
  getModel: IAmbigousFn;
  dispose: IAmbigousFn;
  getValue: () => string;
  onDidChangeModelContent: (input: any) => void;
  setTheme: (input: string) => void;
  setModelLanguage: (model: any, language: string) => void;
  layout: () => void;
  setValue: (value: string) => void;
  executeEdits: IAmbigousFn;
  pushUndoStop: IAmbigousFn;
  EditorOption?: Record<string, any>;
  getOption?: (input: string) => any;
  onDidFocusEditorText: (...args: any[]) => void;
  onDidBlurEditorText: (...args: any[]) => void;
  getModifiedEditor?: () => IEditorInstance;
  setModel: IAmbigousFn;
  revealLineInCenter: IAmbigousFn;
  focus: IAmbigousFn;
  Range: new(...args: any[]) => any;
  getPosition: IAmbigousFn;
  setPosition: IAmbigousFn;
  deltaDecorations: IAmbigousFn;
  addAction: IAmbigousFn;
  saveViewState: () => ICodeEditorViewState;
  createModel: IAmbigousFn;
  [key: string]: any;
}
export interface IMonacoInstance {
  editor?: {
    create: IAmbigousFn;
    [key: string]: any;
  };
  KeyCode?: Record<string, any>;
  KeyMod?: Record<string, any>;
  [otherKeys: string]: any;
}

type ICodeEditorViewState = {
  contributionsState: any;
  cursorState: any;
  viewState: any;
}

export interface IGeneralManacoEditorProps {
  /** [Monaco editor options](https://microsoft.github.io/monaco-editor/) */
  options?: Record<string, any>;
  /** callback after monaco's loaded and after editor's loaded */
  editorDidMount?: (monaco: IMonacoInstance, editor: IEditorInstance) => void;
  /** callback after monaco's loaded and before editor's loaded */
  editorWillMount?: (monaco: IMonacoInstance) => void;
  /** path of the current model, useful when creating a multi-model editor */
  path?: string;
  /** whether to save the models' view states between model changes or not */
  saveViewState?: boolean;
  /** language of the editor @see https://microsoft.github.io/monaco-editor/ for available languages */
  language?: string;
  /** theme of the editor, "light" | "vs-dark" */
  theme?: string;
  /** [config passing to require](https://github.com/suren-atoyan/monaco-react#loader-config), can be used to upgrade monaco-editor */
  requireConfig?: Record<string, any>;
  /** value, controlled */
  value?: string;
  /** defaultValue for creating model, uncontrolled */
  defaultValue?: string;
  /** className of wrapper */
  className?: string;
  /** width of wrapper */
  width?: number | string;
  /** height of wrapper */
  height?: number | string;
  /** whether to enable outline of wrapper or not */
  enableOutline?: boolean;
  /** style of wrapper */
  style?: CSSProperties;
}

export interface ISingleMonacoEditorProps extends IGeneralManacoEditorProps {
  onChange?: (input: string, event: any) => void;
  supportFullScreen?: boolean;
}

export interface IDiffMonacoEditorProps extends IGeneralManacoEditorProps {
  original?: string;
}

const CURRENT_LANGUAGE = ((window as any).locale || window.localStorage.getItem('vdev-locale') || '').replace(/_/, '-') || 'zh-CN';
export const WORD_EDITOR_INITIALIZING = CURRENT_LANGUAGE === 'en-US' ? 'Initializing Editor' : '编辑器初始化中';

export const INITIAL_OPTIONS = {
  fontSize: 12,
  tabSize: 2,
  fontFamily: 'Menlo, Monaco, Courier New, monospace',
  renderIndentGuides: true,
  folding: true,
  minimap: {
    enabled: false,
  },
  autoIndent: true,
  contextmenu: true,
  useTabStops: true,
  wordBasedSuggestions: true,
  formatOnPaste: true,
  automaticLayout: true,
  lineNumbers: 'on',
  wordWrap: 'off',
  scrollBeyondLastLine: false,
  fixedOverflowWidgets: false,
  snippetSuggestions: 'top',
  scrollbar: {
    vertical: 'auto',
    horizontal: 'auto',
    verticalScrollbarSize: 10,
    horizontalScrollbarSize: 10,
  },
};

export const useEditor = (type: 'single' | 'diff', props: IGeneralManacoEditorProps) => {
  const {
    editorDidMount, editorWillMount, theme, value, path, language, saveViewState, defaultValue,
  } = props;

  const [isEditorReady, setIsEditorReady] = useState(false);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const defaultValueRef = useRef(defaultValue);
  const valueRef = useRef(value);
  const languageRef = useRef(language || 'text');
  const pathRef = useRef(path);
  const previousPath = usePrevious(path);
  const requireConfigRef = useRef(props.requireConfig);
  const optionRef = useRef(props.options);
  const monacoRef = useRef<IMonacoInstance>();
  const editorRef = useRef<IEditorInstance>();
  const containerRef = useRef<HTMLDivElement>();
  const typeRef = useRef(type);
  const editorDidMountRef = useRef<ISingleMonacoEditorProps['editorDidMount']>();
  const editorWillMountRef = useRef<ISingleMonacoEditorProps['editorWillMount']>();

  const decomposeRef = useRef(false);
  const viewStatusRef = useRef<Map<any, ICodeEditorViewState>>(new Map())

  useEffect(() => {
    editorDidMountRef.current = editorDidMount;
  }, [editorDidMount]);


  useEffect(() => {
    editorWillMountRef.current = editorWillMount;
  }, [editorWillMount]);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    defaultValueRef.current = defaultValue;
  }, [defaultValue]);

  // make sure loader / editor only init once
  useEffect(() => {
    setLoading(true);

    if (requireConfigRef.current) {
      loader.config(requireConfigRef.current);
    }

    loader.init()
      .then((monaco: any) => {
        // 兼容旧版本 monaco-editor 写死 MonacoEnvironment 的问题
        (window as any).MonacoEnvironment = undefined;
        if (typeof (window as any).define === 'function' && (window as any).define.amd) {
          // make monaco-editor's loader work with webpack's umd loader
          // @see https://github.com/microsoft/monaco-editor/issues/2283
          delete (window as any).define.amd;
        }

        monacoRef.current = monaco;
        try {
          editorWillMountRef.current?.(monaco);
        } catch (err) { }

        if (!containerRef.current) {
          return;
        }
        let editor: IEditorInstance;
        if (typeRef.current === 'single') {
          const model = getOrCreateModel(
            monaco,
            valueRef.current ?? defaultValueRef.current ?? '',
            languageRef.current,
            pathRef.current
          );
          editor = monaco.editor.create(containerRef.current, {
            automaticLayout: true,
            ...INITIAL_OPTIONS,
            ...optionRef.current,
          });
          editor.setModel(model);
        } else {
          const originalModel = monaco
            .editor
            .createModel(valueRef.current, languageRef.current);

          const modifiedModel = monaco
            .editor
            .createModel(valueRef.current, languageRef.current);

          editor = monaco.editor.createDiffEditor(containerRef.current, {
            automaticLayout: true,
            ...INITIAL_OPTIONS,
            ...optionRef.current,
          });

          editor.setModel({ original: originalModel, modified: modifiedModel });
        }

        editorRef.current = editor;
        try {
          editorDidMountRef.current?.(monaco, editor);
        } catch (err) { }
        !decomposeRef.current && setIsEditorReady(true);
      })
      .catch((err: unknown) => {
        // eslint-disable-next-line no-console
        console.error('Monaco Editor Load Error!', err);
      })
      .then(() => {
        !decomposeRef.current && setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!isEditorReady) {
      return;
    }

    monacoRef.current.editor.setTheme(theme);
  }, [isEditorReady, theme]);

  // controlled value
  useEffect(() => {
    if (!isEditorReady) {
      return;
    }

    const editor = type === 'diff'
      ? editorRef.current.getModifiedEditor()
      : editorRef.current;

    const nextValue = value ?? defaultValueRef.current ?? ''
    if (editor?.getOption?.(monacoRef.current?.editor.EditorOption.readOnly)) {
      editor?.setValue(nextValue);
    } else if (value !== editor?.getValue()) {
      editor?.executeEdits('', [{
        range: editor?.getModel().getFullModelRange(),
        text: nextValue,
        forceMoveMarkers: true,
      }]);

      editor?.pushUndoStop();
    }
  }, [isEditorReady, type, value]);

  // focus status
  useEffect(() => {
    if (!isEditorReady) {
      return;
    }

    const editor = type === 'diff'
      ? editorRef.current.getModifiedEditor()
      : editorRef.current;
    editor?.onDidFocusEditorText(() => {
      !decomposeRef.current && setFocused(true);
    });
    editor?.onDidBlurEditorText(() => {
      !decomposeRef.current && setFocused(false);
    });
  }, [isEditorReady, type]);

  // decomposing status
  useEffect(() => {
    return () => {
      decomposeRef.current = true;
    };
  }, []);

  // multi-model implementation
  useEffect(() => {
    if (!isEditorReady) {
      return;
    }

    if (type === 'diff') {
      return;
    }

    if (path === previousPath) {
      return;
    }

    const model = getOrCreateModel(
      monacoRef.current,
      valueRef.current ?? defaultValueRef.current,
      languageRef.current,
      path,
    );

    if (valueRef.current !== null && valueRef.current !== undefined && model.getValue() !== valueRef.current) {
      model.setValue(valueRef.current);
    }
    
    if (model !== editorRef.current.getModel()) {
      saveViewState && viewStatusRef.current.set(previousPath, editorRef.current.saveViewState());
      editorRef.current.setModel(model);
      saveViewState && editorRef.current.restoreViewState(viewStatusRef.current.get(path));
    }
  }, [isEditorReady, path, previousPath, type]);

  return {
    isEditorReady,
    focused,
    loading,
    containerRef,
    monacoRef,
    editorRef,
    valueRef,
  } as const;
};

function getOrCreateModel(monaco: IMonacoInstance, value?: string, language?: string, path?: string) {
  if (path) {
    const prevModel = monaco
      .editor
      .getModel(monaco.Uri.parse(path));
    if (prevModel) {
      return prevModel;
    }
  }

  return monaco
    .editor
    .createModel(value, language, path && monaco.Uri.parse(path));
}

function usePrevious<T>(value: T) {
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}
