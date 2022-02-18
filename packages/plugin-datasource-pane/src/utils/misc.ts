import _isArray from 'lodash/isArray';
import _isPlainObject from 'lodash/isPlainObject';
import _findIndex from 'lodash/findIndex';
import _isUndefined from 'lodash/isUndefined';

/**
 * 合并两个对象数组，如果指定了 KEY，当存在 KEY 值相同的情况，将第一个对象数组里的对象替换
 * @param list1 待合并的第一个对象数组
 * @param list2 待合并的第二个对象数组
 * @param key 判断是否覆盖的对象 KEY
 * @param returns 合并后的对象数组
 */
export function mergeTwoObjectListByKey(
  list1: Array<Record<string, unknown>>,
  list2: Array<Record<string, unknown>>,
  key: string,
) {
  if (!_isArray(list1) && !_isArray(list2)) {
    return [];
  }
  if (!_isArray(list1)) {
    return [...list2];
  }
  if (!_isArray(list2)) {
    return [...list1];
  }
  return list2.reduce((acc, cur) => {
    if (!_isPlainObject(cur)) return acc;
    const indexToReplace = _findIndex(acc, (item) => item[key] === cur[key]);
    if (indexToReplace !== -1) {
      acc[indexToReplace] = { ...cur };
      return acc;
    }
    return acc.concat([cur]);
  }, list1);
}

export function generateClassName(name: string) {
  return `lowcode-plugin-datasource-pane-${name}`;
}

export function safeParse(input: any, fallbackValue?: any) {
  try {
    return JSON.parse(input);
  } catch (err) {
    if (!_isUndefined(fallbackValue)) {
      return fallbackValue;
    }
    return input;
  }
}
