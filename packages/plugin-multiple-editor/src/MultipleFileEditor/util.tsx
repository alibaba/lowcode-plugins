import { initCode, beautifyJs, compatGetSourceCodeMap } from 'utils';
import { useEffect, useMemo, useRef } from 'react';
import { Monaco, ObjectType } from 'types';
import { FunctionEventParams } from 'types';
import type { editor } from 'monaco-editor';

function compatIndexContent(content: string) {
  if (!content.match(/export +default +/)) {
    return content.replace(
      /class +LowcodeComponent/,
      'export default class LowcodeComponent'
    );
  }
  return content;
}

export const getDefaultFileList = (rootSchema: any): ObjectType<string> => {
  const sourceCodeMap = rootSchema?.componentsTree?.[0]?._sourceCodeMap || {};
  const { files } = compatGetSourceCodeMap(sourceCodeMap); // 兼容旧格式
  if (files['index.js']) {
    files['index.js'] = compatIndexContent(files['index.js']);
  }
  const map = {
    'index.js': compatIndexContent(
      beautifyJs(
        rootSchema?.componentsTree?.[0]?.originCode ||
          initCode(rootSchema?.componentsTree?.[0]),
        {}
      )
    ),
    'index.css': rootSchema?.componentsTree?.[0]?.css || '',
    ...files,
  };

  return map;
};

export function useUnReactiveFn(fn: any, deps: any[]) {
  const ref = useRef<{ call: typeof fn }>({ call: () => void 0 });
  useEffect(() => {
    ref.current.call = fn;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps]);

  const handler = useMemo(
    () =>
      (...args: any[]) => {
        ref.current.call(...args);
      },
    []
  );

  return { handler };
}

export function getDefaultFileContent() {
  return `export function hello() {
  console.log('Hello world!');
}
`;
}

export function focusCodeByContent(
  editor: editor.IStandaloneCodeEditor,
  monaco: Monaco,
  content: string
) {
  const matchedResult = editor
    ?.getModel()
    // @ts-ignore
    ?.findMatches(content, false, true, false)?.[0];
  if (matchedResult) {
    setTimeout(() => {
      editor.revealLineInCenter(matchedResult.range.startLineNumber);
      editor.setPosition({
        column: matchedResult.range.endColumn,
        lineNumber: matchedResult.range.endLineNumber,
      });
      editor.focus();
    }, 200);
  }
}

export async function focusByFunctionName(
  editor: editor.IStandaloneCodeEditor,
  params: FunctionEventParams,
  monaco: Monaco
) {
  const modelUri = monaco.Uri.parse('index.js');
  const model = monaco.editor.getModel(modelUri);
  editor.setModel(model);
  const content = `^\\s*(?:async)?\\s*${params.functionName}\\s*\\([\\s\\S]*\\)[\\s\\S]*\\{`;
  focusCodeByContent(editor, monaco, content);
}

export async function addFunction(
  monacoEditor: editor.IStandaloneCodeEditor,
  params: FunctionEventParams,
  monaco: Monaco
) {
  if (!monacoEditor || !monaco) {
    return;
  }
  const count = monacoEditor.getModel()?.getLineCount() ?? 0;
  const range = new monaco.Range(count, 1, count, 1);

  const functionCode = params.template
    ? params.template
    : `\n\t${params.functionName}(){\n\t}\n`;

  monacoEditor.executeEdits('log-source', [
    { range, text: functionCode, forceMoveMarkers: true },
  ]);

  // 延迟定位光标到函数名称
  setTimeout(() => {
    params.functionName && focusByFunctionName(monacoEditor, params, monaco);
  }, 50);
}

export async function initEditorModel(
  fileMap: Record<string, string>,
  monaco: Monaco
) {
  const keys = Object.keys(fileMap);
  for (const filePath of keys) {
    const modelUri = monaco.Uri.parse(filePath);
    const language = /\.js$/.test(filePath) ? 'javascript' : 'css';
    monaco.editor.getModel(modelUri) ||
      monaco.editor.createModel(fileMap[filePath], language, modelUri);
  }
}
