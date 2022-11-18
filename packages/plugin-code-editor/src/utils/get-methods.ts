import traverse from '@babel/traverse';
import { parse } from '@babel/parser';
import {
  transformFromAst as babelTransformFromAst,
} from '@babel/core';

import { functionDeclaration, identifier, Node } from '@babel/types';

import { transformJS } from './transform';
import { defaultBabelConfig } from '../config/default-babel-config';

import { Methods } from '../types';

/**
 * get all methods from code-editor-pane
 */
export const getMethods = (ast: Node) => {
  const methods: Methods = {};
  const errorsByMethods: Record<string, string> = {};
  traverse(ast, {
    enter(path) {
      if (!path.isClassMethod()) {
        return;
      }
      let { node } = path;
      let { name } = node.key;
      let { params } = node;
      let { body } = node;
      // creat empty AST
      const code = parse('');
      code.program.body.push(functionDeclaration(
        identifier(name),
        params.map((p) => {
          if (p.type === 'Identifier') {
            return identifier(p.name);
          } else {
            // 解构语法，或者 ...args
            // 直接返回 ...args，不需要额外的构造
            return p;
          }
        }),
        body,
        node.generator,
        node.async
      ));

      const codeStr = babelTransformFromAst(code).code;
      const { hasError, errorInfo, code: compiledCode = '' } = transformJS(codeStr, defaultBabelConfig)

      if (hasError && errorInfo) {
        errorsByMethods[name] = errorInfo;
      }

      methods[name] = {
        type: 'JSFunction',
        value: compiledCode,
        source: codeStr,
      };
    },
  });
  return { methods, errorsByMethods } as const;
};
