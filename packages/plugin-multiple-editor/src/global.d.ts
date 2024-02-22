declare module '*.png';
declare module '*.svg';

interface Window {
  less: any;
  prettier: typeof import('prettier');
  prettierPlugins: any;
}
