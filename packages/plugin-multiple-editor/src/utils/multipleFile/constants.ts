export const CREATE_REQUIRE = `
var pathResolve = function() {
  function normalizeArray(parts, allowAboveRoot) {
    var res = [];
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (!p || p === '.')
        continue;
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
  var resolvedPath = '', resolvedAbsolute = false;
  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : '/';
    if (!path) { continue; }
    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path[0] === '/';
  }
  resolvedPath = normalizeArray(resolvedPath.split('/'), !resolvedAbsolute).join('/');
  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

function __createRequire(filename) {
  var path = filename.replace(/\\/?\\w+\\.(js|ts)$/, '');
  return function (name) {
    var realFilePath = pathResolve(path, name);
    return __require_impl__(realFilePath);
  };
}
`;

export const REQUIRE_IMPL_TEMPLATE = `
function __require_impl__(file) {
  var key = file.replace(/(^\\.?\\/)|(\\.jsx?)/g, '');
  if (!__toExecFileMap__[key]) {
    key = key + '/index';
  }
  if (!__require_impl__.cache) {
    __require_impl__.cache = {};
  }
  if (!__require_impl__.cache[key]) {
    var content = __toExecFileMap__[key] || '';
    var execContent = '' + 'var exports = {};\\n' + content + '\\n' + 'return exports;'
    execContent = execContent.replace(/CODE_PLACEHOLDER/g, 'th' + 'is');
    __require_impl__.cache[key] = new Function(execContent)();
  }
  return __require_impl__.cache[key];
}
`;

export const GLOBAL_VAR_NAME = 'internalGlobal';

export const GLOBAL_CONTENT = `var ${GLOBAL_VAR_NAME} = typeof global !== 'undefined' ? global : window`;
