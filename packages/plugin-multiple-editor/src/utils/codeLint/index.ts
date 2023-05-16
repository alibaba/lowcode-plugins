import {
  isImportDeclaration,
  isExportDefaultDeclaration,
  isExportDeclaration,
  isVariableDeclaration,
  isFunctionDeclaration,
  isArrowFunctionExpression,
} from '@babel/types';
import { traverse } from '../ghostBabel';

export function lintIndex(content: string) {
  let valid = true;
  let validMsg = '不允许在 index.js 的组件类外定义变量或使用表达式';

  traverse(content, {
    Program(path) {
      for (const node of path.node.body) {
        if (!isExportDefaultDeclaration(node) && !isImportDeclaration(node)) {
          valid = false;
          if (isExportDeclaration(node)) {
            validMsg = '只允许index.js内默认导出，禁止命名导出';
            return;
          }
          if (isVariableDeclaration(node)) {
            validMsg = '不允许在 index.js 的组件类外定义变量';
            return;
          }
          if (isFunctionDeclaration(node)) {
            validMsg = '不允许在 index.js 的组件类外定义函数';
            return;
          }
        }
      }
    },
    ClassProperty(path) {
      if (isArrowFunctionExpression(path.node.value)) {
        valid = false;
        validMsg = '不允许在组件类中使用箭头函数定义类方法';
      }
    },
  });
  return { valid, validMsg };
}
