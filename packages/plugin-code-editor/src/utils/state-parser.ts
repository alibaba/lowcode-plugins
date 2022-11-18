import traverse from '@babel/traverse';
import * as t from '@babel/types';

import { parse } from '@babel/parser';
import {
  transformFromAst as babelTransformFromAst,
} from '@babel/core';

import { transformJS } from './transform';
import { defaultBabelConfig } from '../config/default-babel-config';

import { Node } from '@babel/types';

export const stateParser = (ast: Node) => {
  const state: Record<string, any> = {};
  traverse(ast, {
    enter(path) {
      // get state identifier or literal
      if (path.isIdentifier({ name: 'state' }) || path.isLiteral({ value: 'state' })) {
        const properties = path.container?.value?.properties;
        if (properties) {
          properties.forEach((property) => {
            // creat empty AST
            const code = parse('');
            code.program.body.push(t.variableDeclaration('var', [
              t.variableDeclarator(t.identifier('name'), property.value),
            ]));

            const codeStr = babelTransformFromAst(code).code;
            const compiledCode = transformJS(codeStr, defaultBabelConfig).code;
            if (compiledCode) {
              state[property.key.name ?? property.key.extra.rawValue] = {
                type: 'JSExpression',
                value: compiledCode.replace('var name = ', '').replace(/;$/, ''),
                // 这里的 originalCode 直接放在全局，不挂在局部
                // originCode: codeStr.replace('var name = ', '').replace(/;$/, ''),
              };
            }
          });
        }
      }
    },
  });
  return state;
};
