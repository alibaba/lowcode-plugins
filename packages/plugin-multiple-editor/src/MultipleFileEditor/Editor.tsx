import FileTree from '@/components/FileTree';
import MonacoEditor from '@/components/MonacoEditor';
import { useEditorContext } from '../Context';
import { Dialog, Message } from '@alifd/next';
import cls from 'classnames';
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import './index.less';
import { HandleChangeFn } from '../components/FileTree/TreeNode';
import { languageMap } from '../utils/constants';
import { getKeyByPath, parseKey, treeToMap } from 'utils/files';
import { editorController, HookKeys } from '../Controller';

import { initEditorModel, useUnReactiveFn } from './util';
import type { editor } from 'monaco-editor';
import { Monaco } from '../types';
import { PluginHooks } from '@/Service';

const Editor: FC = () => {
  const editorContext = useEditorContext();
  const {
    fileTree,
    // softSave,
    mode,
    modifiedKeys,
    currentFile: { file, path },
    selectFile,
    updateState,
    initialFileMap,
  } = editorContext;
  const monacoEditor = useRef<editor.IStandaloneCodeEditor>();
  const monacoRef = useRef<Monaco>();
  const [fullscreen, setFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>();
  const filePath = useMemo(
    () => [...path, file?.name].join('/'),
    [file?.name, path]
  );
  const handleChange = useCallback<HandleChangeFn>(
    (file, path) => {
      selectFile(file, path);
    },
    [selectFile]
  );
  const handleEditorChange = useCallback(
    (value: string) => {
      file && (file.content = value);
      const curKey = getKeyByPath(path, file?.name || '');
      editorController.triggerHook(HookKeys.onEditCodeChange, {
        file: path
          .join('/')
          .concat('/')
          .concat(file?.name || ''),
        content: value,
      });
      if (!modifiedKeys.find((k) => k === curKey)) {
        updateState({ modifiedKeys: [...modifiedKeys, curKey] });
      }
    },
    [file, modifiedKeys, path, updateState]
  );

  const handleCompile = useCallback(
    (silent?: boolean) => {
      try {
        const fileMap = treeToMap(fileTree);
        const success = editorController.compileSourceCode(fileMap);
        !silent && success && Message.success('编译成功');
        return true;
      } catch (error) {
        Dialog.alert({
          title: '编译失败',
          content: (
            <pre>{(error as any).message || '编译失败，请检查语法'}</pre>
          ),
        });
        console.error(error);
        return false;
      }
    },
    [fileTree]
  );

  const { handler: handleSave } = useUnReactiveFn(() => {
    if (handleCompile(true)) {
      // 全部保存, 标记清空
      updateState({ modifiedKeys: [] });
    }
  }, [handleCompile]);

  const handleGotoFile = useCallback(
    (filename: string) => {
      const { file, path } = parseKey(filename);
      selectFile(file, path);
    },
    [selectFile]
  );

  const handleEditorMount = useCallback(
    (codeEditor: any, monaco: Monaco) => {
      monacoEditor.current = codeEditor;
      monacoRef.current = monaco;
      initEditorModel(initialFileMap, monaco);
      editorController.initCodeEditor(codeEditor, editorContext);
    },
    [editorContext, initialFileMap]
  );

  useEffect(() => {
    if (monacoEditor.current && editorContext) {
      editorController.initCodeEditor(monacoEditor.current, editorContext);
    }
  }, [editorContext]);

  useEffect(() => {
    const filepath = path
      .join('/')
      .concat('/')
      .concat(file?.name || '');
    editorController.service.triggerHook(PluginHooks.onSelectFileChange, {
      filepath,
      content: file?.content,
    });
    editorController.triggerHook(HookKeys.onEditCodeChange, {
      file: filepath,
      content: file?.content,
    });
  }, [file, path]);

  useEffect(() => {
    editorController.editor?.on(
      'skeleton.panel-dock.unactive',
      (pluginName) => {
        if (
          pluginName === 'codeEditor' ||
          pluginName === 'multiple-file-code-editor'
        ) {
          handleSave();
        }
      }
    );
  }, [handleSave]);
  const handleFullScreen = useCallback((enable: boolean) => {
    setFullscreen(enable);
  }, []);
  return (
    <div
      className={cls(
        'ilp-multiple-editor',
        fullscreen && 'ilp-multiple-editor-fullscreen'
      )}
      ref={containerRef as any}
    >
      <FileTree
        mode={mode}
        dir={fileTree}
        className="ilp-multiple-editor-tree"
        onChange={handleChange}
        onSave={() => handleCompile()}
        fullscreen={fullscreen}
        onFullscreen={handleFullScreen}
      />
      <div className="ilp-multiple-editor-wrapper">
        <h3>{file ? file.name : '无文件'}</h3>
        {file ? (
          <MonacoEditor
            language={languageMap[file.ext || ''] as any}
            filePath={filePath}
            value={file.content}
            onChange={handleEditorChange}
            onGotoFile={handleGotoFile}
            onEditorMount={handleEditorMount}
            isFullscreen={fullscreen}
          />
        ) : (
          '未选中任意文件'
        )}
      </div>
    </div>
  );
};

export default Editor;
