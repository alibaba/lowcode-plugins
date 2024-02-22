/**
 * 使用 @babel/standalone 的能力实现 parse 和 traverse
 */

import {
  transform,
  transformFromAst,
  availablePlugins,
} from '@babel/standalone';
import type {
  Visitor,
  PluginItem,
  ParseResult,
  TransformOptions,
} from '@babel/core';
import { Node, File, file } from '@babel/types';

const defaultBabelOption: TransformOptions = {
  babelrc: false,
  sourceType: 'module',
  plugins: [
    availablePlugins['syntax-jsx'],
    availablePlugins['transform-react-jsx'],
  ],
};

export function traverse(code: string | ParseResult | Node, visitor: Visitor) {
  const plugin: PluginItem = () => {
    return {
      visitor,
    };
  };

  if (typeof code === 'string') {
    transform(code, {
      ...defaultBabelOption,
      plugins: [...(defaultBabelOption.plugins || []), plugin],
    } as any);
  } else {
    transformFromAst(code, undefined, {
      ...defaultBabelOption,
      plugins: [...(defaultBabelOption.plugins || []), plugin],
    } as any);
  }
}

export function parse(code: string): File {
  let ast: File;
  traverse(code, {
    Program(path) {
      ast = file(path.node);
    },
  });
  // @ts-ignore
  return ast;
}
export function generateOutline(ast: any) {
  const outlineMap: any[] = [];

  function traverse(node: any, outline: any) {
    if (!node) {
      return;
    }
    if (!getName(node) && !node.type) return;
    let outlineNode: any = {};
    if (getName(node)) {
      outlineNode = {
        name: getName(node),
        type: node.type,
        children: [],
      };
      outline.push(outlineNode);
      if (
        !(node?.type === 'ClassDeclaration' || node?.type === 'ObjectProperty')
      )
        return;
    }
    for (const key in node) {
      if (Object.prototype.hasOwnProperty.call(node, key)) {
        const childNode = node[key];
        if (Array.isArray(childNode)) {
          childNode.forEach((child) =>
            traverse(child, outlineNode?.children || outline)
          );
        } else if (typeof childNode === 'object') {
          traverse(childNode, outlineNode.children || outline);
        }
      }
    }
  }

  traverse(ast, outlineMap);
  return outlineMap;
}

export function getName(node: any) {
  switch (node.type) {
  case 'FunctionDeclaration':
    return node.id.name;
  case 'VariableDeclarator':
    return node.id.name;
  case 'ClassDeclaration':
    return node.id.name;
  case 'ClassProperty':
    return node.key.name;
  case 'ObjectProperty':
    return node.key.name;
  case 'ClassMethod':
    return node.key.name;
  case 'ObjectMethod':
    return node.key.name;
  default:
    return null;
  }
}
