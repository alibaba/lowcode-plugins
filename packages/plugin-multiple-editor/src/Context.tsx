import {
  createContext,
  FC,
  useContext,
  useReducer,
  useMemo,
  useCallback,
  useEffect,
} from 'react';

import React from 'react';
import {
  deleteNodeOnTree,
  Dir,
  File,
  fileMapToTree,
  getFileByPath,
  getInitFile,
  insertNodeToTree,
  parseKey,
  sortDir,
} from './utils/files';
import { editorController } from './Controller';
import { getDefaultFileList } from './MultipleFileEditor/util';

export type CurrentFile = {
  file?: File;
  path: string[];
};

export interface EditorContextType {
  declarations: string;
  fileTree: Dir;
  mode?: 'single' | 'multiple';
  currentFile: CurrentFile;
  modifiedKeys: string[];
  softSave?: boolean;
  updateFileTree(tree: Dir): void;
  updateFileTreeByPath(
    path: string[],
    target: Dir | File,
    operation: 'delete' | 'add'
  ): void;
  selectFile(file: File | string, path: string[]): void;
  selectFileByName(name: string): void;
  updateState(state: Partial<StoreState>): void;
  initialFileMap: Record<string, string>;
  extraLibs: { path: string; content: string }[];
}

export const EditorContext = createContext<EditorContextType>({
  declarations: '',
} as any);

const { Provider, Consumer: EditorConsumer } = EditorContext;

export { EditorConsumer };

export interface StoreState {
  mode?: 'single' | 'multiple';
  declarations: string;
  fileTree: Dir;
  currentFile: CurrentFile;
  modifiedKeys: string[];
  extraLibs: { path: string; content: string }[];
}

function reducer(state: StoreState, action: { type: string; payload: any }) {
  const { type, payload } = action;
  switch (type) {
  case 'update': {
    return { ...state, ...payload };
  }
  default: {
    return state;
  }
  }
}

export const EditorProvider: FC<{
  softSave?: boolean;
  mode?: 'single' | 'multiple';
}> = (props) => {
  const { softSave, mode } = props;
  const fileMap = useMemo(
    () => editorController.getCodeTemp()?._sourceCodeMap.files || {},
    []
  );
  const initFileTree = fileMap ? fileMapToTree(fileMap) : new Dir('/');
  const initState: StoreState = {
    declarations: '',
    extraLibs: [],
    fileTree: sortDir(initFileTree),
    currentFile: { path: [], file: getInitFile(initFileTree) },
    modifiedKeys: [],
  };
  const [_state, dispatch] = useReducer<typeof reducer>(reducer, initState);
  const state = _state as StoreState;

  const selectFile = useCallback(
    (file: string | File, path: string[]) => {
      let finalFile: File;
      if (typeof file === 'string') {
        const { fileTree } = state;
        const targetFile = getFileByPath(fileTree, file, path);
        finalFile = targetFile || new File('index.js', '');
      } else {
        finalFile = file;
      }
      dispatch({
        type: 'update',
        payload: { currentFile: { file: finalFile, path } },
      });
    },
    [state]
  );
  const contextValue = useMemo<EditorContextType>(
    () => ({
      ...state,
      mode,
      initialFileMap: fileMap,
      softSave,
      updateFileTree(tree: Dir) {
        dispatch({ type: 'update', payload: { fileTree: sortDir(tree) } });
      },
      updateFileTreeByPath(path, target, operation) {
        const { fileTree } = state;
        if (operation === 'add') {
          insertNodeToTree(fileTree, path, target);
        } else if (operation === 'delete') {
          deleteNodeOnTree(fileTree, path, target);
        }
        const payload: Partial<StoreState> = { fileTree: sortDir(fileTree) };
        // 新增文件时，选中当前文件
        if (target.type === 'file' && operation === 'add') {
          payload.currentFile = { file: target as File, path };
        } else if (target.type === 'file' && operation === 'delete') {
          payload.currentFile = { file: getInitFile(fileTree), path: [] };
        }
        dispatch({ type: 'update', payload });
      },
      selectFile,
      selectFileByName(filename: string) {
        const { path, file } = parseKey(filename);
        selectFile(file, path);
      },
      updateState(state: Partial<StoreState>) {
        dispatch({ type: 'update', payload: state });
      },
    }),
    [fileMap, selectFile, softSave, state]
  );
  useEffect(() => {
    const off = editorController.onSourceCodeChange((codeMap) => {
      const fileTree = fileMapToTree(codeMap) || new Dir('/');
      dispatch({ type: 'update', payload: { fileTree } });
      const targetFile = getFileByPath(fileTree, 'index.js', []);
      setTimeout(() => {
        selectFile(targetFile || 'index.js', []);
      }, 100);
    });
    return () => off();
  }, [selectFile]);
  return <Provider value={contextValue}>{props.children}</Provider>;
};

export function useEditorContext() {
  return useContext<EditorContextType>(EditorContext);
}
