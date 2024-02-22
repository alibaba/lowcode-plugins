import uniqBy from 'lodash/uniqBy';

export const pathResolve: (...args: string[]) => string = function () {
  function normalizeArray(parts: string[], allowAboveRoot: boolean) {
    const res = [];
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (!p || p === '.') continue;
      if (p === '..') {
        if (res.length && res[res.length - 1] !== '..') {
          res.pop();
        } else if (allowAboveRoot) {
          res.push('..');
        }
      } else {
        res.push(p);
      }
    }
    return res;
  }
  let resolvedPath = '',
    resolvedAbsolute = false;
  for (let i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    // eslint-disable-next-line prefer-rest-params
    const path = i >= 0 ? arguments[i] : '/';
    if (!path) {
      continue;
    }
    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path[0] === '/';
  }
  resolvedPath = normalizeArray(
    resolvedPath.split('/'),
    !resolvedAbsolute
  ).join('/');
  return (resolvedAbsolute ? '/' : '') + resolvedPath || '.';
};

export function resolveFilePath(filepath: string) {
  const list = filepath.replace(/^\//, '').split('/');
  return list.slice(0, list.length - 1).join('/');
}

export function getFilesByPath(files: Record<string, string>, path: string) {
  const fileKeys = Object.keys(files);
  const getDirsFromList = (list: string[]) =>
    uniqBy(
      list
        .filter((f) => f.replace(/^\//, '').split('/').length > 1)
        .map((f) => ({ type: 'dir', path: f.split('/')[0] })),
      (i) => i.path
    );
  if (!path || path === '/') {
    const fileList = fileKeys
      .filter((key) => key.replace(/^\//, '').split('/').length === 1)
      .map((f) => ({ type: 'file', path: f.split('/')[0] }));
    return [...getDirsFromList(fileKeys), ...fileList];
  }

  const normalizedList = fileKeys
    .filter((key) => key.replace(/^\//, '').startsWith(path.replace(/^\//, '')))
    .map((f) => f.replace(`${path.replace(/(\/$)|(^\/)/g, '')}/`, ''));
  const fileList = normalizedList
    .filter((f) => f.split('/').length === 1)
    .map((f) => ({ type: 'file', path: f }));

  return [...getDirsFromList(normalizedList), ...fileList];
}
