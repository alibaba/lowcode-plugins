/**
 * 使用 @babel/standalone 的能力实现 parse 和 traverse
 */

import { transform, transformFromAst } from '@babel/standalone';
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
      plugins: [plugin],
    });
  } else {
    transformFromAst(code, undefined, {
      ...defaultBabelOption,
      plugins: [plugin],
    });
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
