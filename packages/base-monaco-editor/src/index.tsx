import * as React from 'react';
import { useRef, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import type { editor } from 'monaco-editor';
import {
  ISingleMonacoEditorProps,
  WORD_EDITOR_INITIALIZING,
  useEditor,
  IDiffMonacoEditorProps,
  INITIAL_OPTIONS,
} from './helper';

export * from './monaco';
export * from './controller';

const SingleMonacoEditor = (props: ISingleMonacoEditorProps) => {
  const { onChange, enableOutline, width, height, language, supportFullScreen } = props;
  const onChangeRef = useRef(onChange);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fullScreenStyle, setFullScreenStyle] = useState({});

  const {
    isEditorReady,
    focused,
    loading,
    containerRef,
    monacoRef,
    editorRef,
    valueRef,
  } = useEditor<editor.IStandaloneCodeEditor>('single', props);
  const subscriptionRef = useRef(null);

  const className = classNames('lc-code-control', props.className, {
    've-focused': focused,
    've-outline': enableOutline,
  });

  const fullScreenClassName = classNames(
    {
      'base-monaco-full-screen-icon': !isFullScreen,
      'base-monaco-full-screen-icon-cancel': isFullScreen,
    },
  );

  const style = useMemo(
    () => ({ width, height }),
    [width, height],
  );

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (isEditorReady) {
      const editorInstance = editorRef.current;
      subscriptionRef.current?.dispose();
      subscriptionRef.current = editorInstance?.onDidChangeModelContent((event: any) => {
        const editorValue = editorInstance?.getModel().getValue();

        if (valueRef.current !== editorValue) {
          onChangeRef.current?.(editorValue, event);
        }
      });
    }
  }, [editorRef, isEditorReady, subscriptionRef, valueRef]);

  useEffect(() => {
    return () => {
      const editorInstance = editorRef.current;
      subscriptionRef.current?.dispose();
      editorInstance?.getModel()?.dispose();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      editorRef.current?.dispose();
    };
  }, [editorRef]);

  useEffect(() => {
    if (!isEditorReady) {
      return;
    }

    monacoRef.current?.editor.setModelLanguage((editorRef.current)?.getModel(), language);
  }, [editorRef, isEditorReady, language, monacoRef]);

  const fullScreen = () => {
    const editorInstance = editorRef.current;
    if (!isFullScreen) {
      setIsFullScreen(true);
      setFullScreenStyle({
        width: 'auto',
        height: 'auto',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9998,
      });
      // 更新小地图配置
      editorInstance?.updateOptions({
        ...editorInstance?.getOptions(),
        minimap: {
          enabled: true,
        },
      });
      editorInstance?.layout();
    } else {
      setIsFullScreen(false);
      editorInstance?.updateOptions({
        ...editorInstance?.getOptions(),
        minimap: {
          enabled: false,
        },
      });
      editorInstance?.layout();
    }
  };

  return (
    <div className={className} style={props.style}>
      {loading && <span className="loading">{WORD_EDITOR_INITIALIZING}</span>}

      <div
        ref={containerRef}
        className="react-monaco-editor-container"
        style={isFullScreen ? fullScreenStyle : style}
      >
        {supportFullScreen && <div className={fullScreenClassName} onClick={fullScreen} />}
      </div>
    </div>
  );
};

const DiffMonacoEditor = (props: IDiffMonacoEditorProps) => {
  const { enableOutline, width, height, language, original } = props;

  const { isEditorReady, focused, loading, containerRef, monacoRef, editorRef } = useEditor<editor.IStandaloneDiffEditor>(
    'diff',
    props,
  );

  const className = classNames('lc-code-control', props.className, {
    've-focused': focused,
    've-outline': enableOutline,
  });
  const style = useMemo(
    () => ({ width, height }),
    [width, height],
  );

  useEffect(() => {
    if (!isEditorReady) {
      return;
    }
    (editorRef.current).getModel().original.setValue(original ?? '');
  }, [editorRef, isEditorReady, original]);

  useEffect(() => {
    return () => {
      editorRef.current?.getModel().original?.dispose();
      editorRef.current?.getModel().modified?.dispose();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      editorRef.current?.dispose();
    };
  }, [editorRef]);

  useEffect(() => {
    if (!isEditorReady) {
      return;
    }

    const { original: originalModel, modified: modifiedModel } = editorRef.current?.getModel();

    monacoRef.current?.editor.setModelLanguage(originalModel, language);
    monacoRef.current?.editor.setModelLanguage(modifiedModel, language);
  }, [editorRef, isEditorReady, language, monacoRef]);

  return (
    <div className={className} style={props.style}>
      {loading && <span className="loading">{WORD_EDITOR_INITIALIZING}</span>}
      <div
        ref={containerRef}
        className="react-monaco-editor-container react-monaco-editor-diff-container"
        style={style}
      />
    </div>
  );
};

const DiffMonacoEditorComponent = Object.assign(DiffMonacoEditor, {
  displayName: 'DiffMonacoEditor',
  defaultProps: {
    width: '100%',
    height: 150,
    defaultValue: '',
    language: 'javascript',
    options: INITIAL_OPTIONS,
    editorDidMount: noop,
    editorWillMount: noop,
    onChange: noop,
    requireConfig: {},
  },
});

export const SingleMonacoEditorComponent = Object.assign(SingleMonacoEditor, {
  displayName: 'SingleMonacoEditor',
  defaultProps: {
    width: '100%',
    height: 150,
    defaultValue: '',
    language: 'javascript',
    options: INITIAL_OPTIONS,
    editorDidMount: noop,
    editorWillMount: noop,
    onChange: noop,
    requireConfig: {},
  },
  MonacoDiffEditor: DiffMonacoEditorComponent,
});

export default SingleMonacoEditorComponent;

function noop() {}
