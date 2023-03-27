import { transform } from './babel';
import { TransformResult } from '../types';

export const transformJS = (code, config): TransformResult => {
  let hasError = false;
  let errorInfo = '';
  let transformCode = '';
  let errorLocation = undefined;
  try {
    transformCode = transform(code, config).code;
  } catch (ex: any) {
    hasError = true;
    errorInfo = ex.message?.split('\n')?.[0] ?? '代码解析异常';
    errorInfo = errorInfo.replace('unknown: ', '')
    errorLocation = ex.loc;
  }

  return {
    hasError,
    errorInfo,
    errorLocation,
    code: transformCode,
  };
};
