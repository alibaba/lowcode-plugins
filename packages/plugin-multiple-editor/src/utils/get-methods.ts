import { transformFromAst as babelTransformFromAst } from '@babel/standalone';
import template from '@babel/template';
import { traverse } from './ghostBabel';

import {
  functionDeclaration,
  identifier,
  blockStatement,
  Identifier,
  ObjectExpression,
  ObjectProperty,
  Expression,
  file,
  program,
  variableDeclaration,
  variableDeclarator,
  isArrowFunctionExpression,
  isBlockStatement,
  returnStatement,
} from '@babel/types';

import { Methods } from '../types';
import { pureTranspile } from './multipleFile/babel';
import { ensureCtrForIndex } from './transformUMD';

const LIFECYCLES_FUNCTION_MAP = {
  react: [
    'constructor',
    'render',
    'componentDidMount',
    'componentDidUpdate',
    'componentWillUnmount',
    'componentDidCatch',
  ],
};

/**
 * get all methods from code-editor-pane
 */
export const getMethods = (fileContent: string) => {
  const realIndexContent = ensureCtrForIndex(fileContent);
  const methodList: Methods = {};
  const state: Record<string, any> = {};
  traverse(realIndexContent, {
    ClassMethod(path) {
      const { node } = path;
      // @ts-ignore
      const { name } = node.key;
      const { params } = node;
      // creat empty AST
      const code = file(program([]));
      const callName = name === 'constructor' ? '__constructor' : name;
      const callExpressionString = template(`
        return this.$ss.default.prototype.${callName}.apply(this, Array.prototype.slice.call(arguments));
      `)();
      code.program.body.push(
        functionDeclaration(
          identifier(name),
          // @ts-ignore
          params.map((p) => {
            if (p.type === 'Identifier') {
              return identifier(p.name);
            } else {
              // 解构语法，或者 ...args
              // 直接返回 ...args，不需要额外的构造
              return p;
            }
          }) as any[],
          /**
           * 所有js文件都会经过编译
           * 那么实际上在收集方法的时候只需调用 index.js 默认导出的类的原型方法即可。
           * constructor 由于其特殊性，仍走远来的逻辑
           * 只有多其他方法走这个转换
           */
          // name === 'constructor'
          //   ? body
          //   :
          blockStatement(
            Array.isArray(callExpressionString)
              ? callExpressionString
              : [callExpressionString]
          ),
          node.generator,
          node.async
        )
      );
      // @ts-ignore
      const codeStr = babelTransformFromAst(code, undefined, {}).code;

      methodList[name] = {
        type: 'JSFunction',
        value: codeStr,
      };
    },
    ClassProperty({ node }) {
      const key = node.key as Identifier;
      const stateValue = node.value as ObjectExpression;
      if (key.name === 'state') {
        const properties = stateValue.properties || [];
        for (const property of properties as ObjectProperty[]) {
          const code = file(program([]));
          code.program.body.push(
            variableDeclaration('var', [
              variableDeclarator(
                identifier('name'),
                property.value as Expression
              ),
            ])
          );
          const codeStr = (babelTransformFromAst(code, undefined, {}) as any)
            ?.code;
          const compiledCode = pureTranspile(codeStr, { esm: true });
          state[
            (property.key as Identifier).name ?? property?.key?.extra?.rawValue as string
          ] = {
            type: 'JSExpression',
            value: compiledCode.replace(/var *name *= */, '').replace(/;$/, ''),
          };
        }
      }
      if (isArrowFunctionExpression(node.value)) {
        const { name } = node.key as Identifier;
        const ast = file(program([]));
        const { body, params, generator, async: isAsync } = node.value;
        ast.program.body.push(
          functionDeclaration(
            node.key as Identifier,
            params,
            isBlockStatement(body)
              ? body
              : blockStatement([returnStatement(body as Expression)]),
            generator,
            isAsync
          )
        );
        methodList[name] = {
          type: 'JSFunction',
          value: (babelTransformFromAst(ast, undefined, {}) as any).code,
        };
      }
    },
  });
  const methods: any = {};
  const lifeCycles: any = {};
  for (const key of Object.keys(methodList)) {
    if (LIFECYCLES_FUNCTION_MAP.react.find((k) => k === key)) {
      lifeCycles[key] = methodList[key];
    } else {
      methods[key] = methodList[key];
    }
  }
  return { methods, lifeCycles, state };
};
