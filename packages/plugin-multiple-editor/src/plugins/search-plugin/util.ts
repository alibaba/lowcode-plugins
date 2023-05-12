import type { editor } from 'monaco-editor';

export function findEditorMatch(
  model: editor.ITextModel,
  method: string
): editor.FindMatch {
  let matchRes = model.findMatches(
    `^\\s*(?:async)?\\s*${method}\\s*\\([\\s\\S]*\\)[\\s\\S]*\\{`,
    false,
    true,
    false,
    null,
    false
  )?.[0];
  if (!matchRes) {
    // 箭头函数
    matchRes = model.findMatches(
      `\\s*${method}\\s*=\\s*(async)?\\s*\\([\\s\\S]*\\)\\s*=>[\\s\\S]*\\{`,
      false,
      true,
      false,
      null,
      false
    )?.[0];
  }
  return matchRes;
}
