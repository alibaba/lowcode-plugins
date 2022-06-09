import loader, { Monaco } from '@monaco-editor/loader';
import isEqual from 'lodash/isEqual';

export interface Configure {
  singleton?: boolean;
}

const CONFIGURE_KEY = '__base_monaco_editor_config__';
const fakeWindow: any = window;

if (!fakeWindow[CONFIGURE_KEY]) {
  fakeWindow[CONFIGURE_KEY] = {};
}

export const configuration: Configure = fakeWindow[CONFIGURE_KEY];

export const getSingletonMonaco = (() => {
  let monaco: Monaco;
  let prevOptions: any;
  return async (options?: any) => {
    if (!monaco || !isEqual(prevOptions, options)) {
      const hasConfig = Object.keys(options || {}).length > 0;
      loader.config(
        hasConfig
          ? options
          : {
              paths: {
                vs: 'https://g.alicdn.com/code/lib/monaco-editor/0.33.0/min/vs',
              },
            },
      );
      monaco = await loader.init();
      prevOptions = options;
    }
    return monaco;
  };
})();

export const getCommonMonaco = (config: any): Promise<Monaco> => {
  if (config) {
    loader.config(config);
  } else {
    loader.config({
      paths: {
        vs: 'https://g.alicdn.com/code/lib/monaco-editor/0.31.1/min/vs',
      },
    });
  }
  return loader.init();
};

export function getMonaco(config: any) {
  const hasConfig = Object.keys(config || {}).length > 0;
  const monacoConfig = hasConfig ? config : undefined;
  return configuration.singleton
    ? getSingletonMonaco(monacoConfig)
    : getCommonMonaco(monacoConfig);
}

export function configure(conf: Configure) {
  Object.assign(configuration, conf || {});
}
