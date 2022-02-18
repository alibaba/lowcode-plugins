import _isArray from 'lodash/isArray';
import _isPlainObject from 'lodash/isPlainObject';

const DATASOURCE_HANDLER_NAME_LIST = [
  'dataHandler',
  'errorHandler',
  'willFetch',
  'shouldFetch',
];

/**
 * 协议是否合法
 * @param schema 协议
 */
export function isSchemaValid(schema: any) {
  if (!_isPlainObject(schema)) return false;
  if (schema.list && !_isArray(schema.list)) return false;
  if (_isArray(schema?.list)) {
    return schema.list.every((dataSource) => {
      return DATASOURCE_HANDLER_NAME_LIST.every((dataSourceHandlerName) => {
        if (dataSource?.[dataSourceHandlerName]?.type === 'JSFunction') {
          return true;
        }
        if (!(dataSourceHandlerName in dataSource)) {
          return true;
        }
        return false;
      });
    });
  }
  return true;
}

/**
 * 纠正协议
 * @param schema 原协议
 * @param schema 纠正后的协议
 */
export function correctSchema(schema: any) {
  if (!_isPlainObject(schema)) return { list: [] };
  const res = {
    ...schema,
  };
  if (_isArray(res?.list)) {
    res.list = res.list.map((dataSource) => {
      const nextDataSource = { ...dataSource };
      DATASOURCE_HANDLER_NAME_LIST.forEach((dataSourceHandlerName) => {
        if (
          nextDataSource?.[dataSourceHandlerName]?.type !== 'JSFunction' &&
          dataSourceHandlerName in nextDataSource
        ) {
          delete nextDataSource[dataSourceHandlerName];
        }
      });
      return nextDataSource;
    });
  } else {
    res.list = [];
  }
  return res;
}
