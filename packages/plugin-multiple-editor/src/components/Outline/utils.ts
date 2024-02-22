import { Monaco } from '@/types';
import type { editor } from 'monaco-editor';
export function focusCodeByContent(
  editor: editor.IStandaloneCodeEditor,
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
export async function focusByContent(
  editor: editor.IStandaloneCodeEditor,
  params: {
    name: string;
    type: string;
  },
  monaco: Monaco,
  path: string
) {
  const regMap: Record<string, string> = {
    FunctionDeclaration: 'function',
    ClassMethod: 'function',
    ObjectMethod: 'function',
    ClassProperty: 'declarator',
    VariableDeclarator: 'declarator',
    ObjectProperty: 'ObjectProperty',
    ClassDeclaration: 'ClassDeclaration',
  };
  const modelUri = monaco.Uri.parse(path);
  const model = monaco.editor.getModel(modelUri);
  editor.setModel(model);
  let content = '';
  switch (regMap[params.type]) {
  case 'function':
    content = `\\s*(?:async)?\\s*${params.name}\\s*\\([\\s\\S]*\\)[\\s\\S]*\\{`;
    break;
  case 'declarator':
    content = `\\s*${params.name}\\s*=\\s*`;
    break;
  case 'ObjectProperty':
    content = `\\s*${params.name}:\\s*`;
    break;
  case 'ClassDeclaration':
    content = `${params.name} extends`;
    break;
  }
  focusCodeByContent(editor, content);
}
