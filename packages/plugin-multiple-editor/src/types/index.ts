export type Monaco = typeof import('monaco-editor/esm/vs/editor/editor.api');
export type ObjectType<T = any> = Record<string, T>;

export interface IState {
  originCode?: string;
}

export interface FunctionEventParams {
  functionName: string;
  template?: string;
}

export interface Methods {
  [key: string]: {
    type: 'JSFunction';
    value: string;
  };
}
