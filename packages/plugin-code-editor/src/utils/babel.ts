import {
  transformFromAst as babelTransformFromAst,
  transform as babelTransform,
  buildExternalHelpers as babelBuildExternalHelpers,
} from '@babel/core';
import presetEnv from '@babel/preset-env';
import presetReact from '@babel/preset-react';

const isArray =
  Array.isArray ||
  ((arg) => Object.prototype.toString.call(arg) === '[object Array]');

  export const availablePresets = {};
  export const availablePlugins = {};

function loadBuiltin(builtinTable, name) {
  if (isArray(name) && typeof name[0] === 'string') {
    if (Object.prototype.hasOwnProperty.call(builtinTable, name[0])) {
      return [builtinTable[name[0]]].concat(name.slice(1));
    }
    return;
  } else if (typeof name === 'string') {
    return builtinTable[name];
  }
  // Could be an actual preset/plugin module
  return name;
}

function processOptions(options) {
  // Parse preset names
  const presets = (options.presets || []).map((presetName) => {
    const preset = loadBuiltin(availablePresets, presetName);

    if (preset) {
      // workaround for babel issue
      // at some point, babel copies the preset, losing the non-enumerable
      // buildPreset key; convert it into an enumerable key.
      if (
        isArray(preset) &&
        typeof preset[0] === 'object' &&
        Object.prototype.hasOwnProperty.call(preset[0], 'buildPreset')
      ) {
        preset[0] = { ...preset[0], buildPreset: preset[0].buildPreset };
      }
    } else {
      throw new Error(
        `Invalid preset specified in Babel options: "${presetName}"`,
      );
    }
    return preset;
  });

  // Parse plugin names
  const plugins = (options.plugins || []).map((pluginName) => {
    const plugin = loadBuiltin(availablePlugins, pluginName);

    if (!plugin) {
      throw new Error(
        `Invalid plugin specified in Babel options: "${pluginName}"`,
      );
    }
    return plugin;
  });

  return {
    babelrc: false,
    ...options,
    presets,
    plugins,
  };
}

export function registerPreset(name: string, preset: Object | Function): void {
  if (Object.prototype.hasOwnProperty.call(availablePresets, name)) {
    if (name === 'env') {
      console.warn(
        '@babel/preset-env is now included in @babel/standalone, please remove @babel/preset-env-standalone',
      );
    } else {
      console.warn(
        `A preset named "${name}" is already registered, it will be overridden`,
      );
    }
  }
  availablePresets[name] = preset;
}

export function transform(code: string, options: Object) {
  return babelTransform(code, processOptions(options));
}


export function registerPresets(newPresets: {
  // @ts-ignore
  [string]: Object | Function;
}): void {
  Object.keys(newPresets).forEach((name) => registerPreset(name, newPresets[name]));
}


registerPresets({
  env: presetEnv,
  // es2016: () => {
  //   return {
  //     plugins: [availablePlugins["transform-exponentiation-operator"]],
  //   };
  // },
  // es2017: () => {
  //   return {
  //     plugins: [availablePlugins["transform-async-to-generator"]],
  //   };
  // },
  react: presetReact,
  // "stage-0": presetStage0,
  // "stage-1": presetStage1,
  // "stage-2": presetStage2,
  // "stage-3": presetStage3,
  // "es2015-loose": {
  //   presets: [[preset2015, { loose: true }]],
  // },
  // ES2015 preset with es2015-modules-commonjs removed
  // "es2015-no-commonjs": {
  //   presets: [[preset2015, { modules: false }]],
  // },
  // typescript: presetTypescript,
  // flow: presetFlow,
});
