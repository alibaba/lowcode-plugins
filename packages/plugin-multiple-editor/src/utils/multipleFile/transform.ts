import { Compiler } from './Compiler';
import { ObjectType } from './types';

export function transform(
  files: ObjectType<string>,
  options?: {
    es6?: boolean;
    plugins?: any[];
    presets?: any[];
    entry?: string;
    clearDefault?: boolean;
  }
) {
  const { entry, presets, plugins, clearDefault, es6 } = options || {};
  const compiler = new Compiler({
    es6,
    files,
    entry,
    presets,
    plugins,
    clearDefault,
  });
  return compiler.compile();
}
