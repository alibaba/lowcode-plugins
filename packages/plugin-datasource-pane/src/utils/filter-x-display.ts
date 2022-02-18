import _isPlainObject from 'lodash/isPlainObject';
import _get from 'lodash/get';

const FILTER_KEY = 'x-display';
const FILTER_VALUE = ['hidden', 'none'];

const shouldDeleteKey = (targetObject: Record<string, any>) => {
  Object.keys(targetObject).forEach((key) => {
    if (FILTER_VALUE.includes(targetObject[key][FILTER_KEY])) {
      delete targetObject[key];
    }
  });
};

export const filterXDisplay = (formSchema: any) => {
  if (!_isPlainObject(formSchema)) return;

  if (_get(formSchema, 'properties')) {
    shouldDeleteKey(formSchema.properties);
  }

  if (_get(formSchema, 'properties.options.properties')) {
    shouldDeleteKey(formSchema.properties.options.properties);
  }
};
