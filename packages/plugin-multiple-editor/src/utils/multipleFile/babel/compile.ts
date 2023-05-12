import {
  transform,
  availablePresets,
  availablePlugins,
} from '@babel/standalone';
import { GLOBAL_CONTENT, GLOBAL_VAR_NAME } from '../constants';
import { FileCls } from '../utils/file-module';
import modulePlugin from './plugin-transform-import';

export function pureTranspile(
  content: string,
  options?: {
    esm?: boolean;
    clearDefault?: boolean;
    presets?: any;
    plugins?: any;
    es6?: boolean;
  }
) {
  const { clearDefault, esm, es6 } = options || {};

  let presets =
    clearDefault || es6
      ? []
      : [
        [
          availablePresets['env'],
          {
            modules: esm ? false : 'cjs',
            exclude: [
              'babel-plugin-transform-async-to-generator',
              'babel-plugin-transform-regenerator',
            ],
          },
        ],
        availablePresets['react'],
      ];
  let plugins: any[] = [modulePlugin];
  if (es6) {
    plugins.unshift(availablePlugins['transform-modules-commonjs']);
  }
  if (options?.presets) {
    presets = presets.concat(options.presets);
  }
  if (options?.plugins) {
    plugins = plugins.concat(options.plugins);
  }

  const result = transform(content, {
    babelrc: false,
    presets,
    plugins,
    sourceType: 'module',
  });
  return result.code || '';
}

export function transpile({ name, content }: FileCls, options?: any): string {
  const result = pureTranspile(content, options);
  return `
  var __filename="${name}";
  ${GLOBAL_CONTENT};
  var __require__ = ${GLOBAL_VAR_NAME}.__createRequire(__filename);
  ${result || ''}
  `;
}
