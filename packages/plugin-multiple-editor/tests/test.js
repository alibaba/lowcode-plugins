function __initExtra() {

  var internalGlobal = typeof global !== 'undefined' ? global : window;

  function __require_impl__(file) {
    var key = file.replace(/(^\.?\/)|(\.jsx?)/g, '');
    if (!__toExecFileMap__[key]) {
      key = key + '/index';
    }
    if (!__require_impl__.cache) {
      __require_impl__.cache = {};
    }
    if (!__require_impl__.cache[key]) {
      var content = __toExecFileMap__[key] || '';
      __require_impl__.cache[key] = new Function(
        '' + 'var exports = {};\n' + content + '\n' + 'return exports;'
      )();
    }
    return __require_impl__.cache[key];
  }


  function __createRequire(filename) {
    var path = filename.replace(/\/?\w+\.(js|ts)$/, '');
    return function (name) {
      var realFilePath = name;
      if (/^\.\//.test(name)) {
        realFilePath = path + '/' + name.replace(/^\.\//, '');
      }
      return __require_impl__(realFilePath);
    };
  }

  internalGlobal.__createRequire = __createRequire;
  internalGlobal.__require_impl__ = __require_impl__;
  var __toExecFileMap__ =
  {
    'index': '\n  var __filename="index.js";\n  var internalGlobal = typeof global !== \'undefined\' ? global : window;\n  var __require__ = internalGlobal.__createRequire(__filename);\n  "use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports["default"] = void 0;\n\nvar _index = _interopRequireDefault(__require__("./util/index"));\n\nvar _index2 = __require__("./service/index");\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }\n\nvar LowcodeComponent = /*#__PURE__*/function () {\n  function LowcodeComponent() {\n    _classCallCheck(this, LowcodeComponent);\n  }\n\n  _createClass(LowcodeComponent, [{\n    key: "componentDidMount",\n    value: function componentDidMount() {\n      // service()\n      console.log(\'mount1231231323\', (0, _index["default"])());\n    }\n  }, {\n    key: "testFunc",\n    value: function testFunc() {\n      console.log(\'test function\');\n    }\n  }]);\n\n  return LowcodeComponent;\n}();\n\nexports["default"] = LowcodeComponent;\n  ',
    'util/index': '\n  var __filename="util/index.js";\n  var internalGlobal = typeof global !== \'undefined\' ? global : window;\n  var __require__ = internalGlobal.__createRequire(__filename);\n  "use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports["default"] = util;\n\nvar _common = __require__("./common");\n\nfunction util() {\n  return "".concat((0, _common.common)(), "-456");\n}\n  ',
    'util/common': '\n  var __filename="util/common.js";\n  var internalGlobal = typeof global !== \'undefined\' ? global : window;\n  var __require__ = internalGlobal.__createRequire(__filename);\n  "use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports.common = common;\n\nfunction common() {\n  return 123;\n}\n  ',
    'service/index': '\n  var __filename="service/index.js";\n  var internalGlobal = typeof global !== \'undefined\' ? global : window;\n  var __require__ = internalGlobal.__createRequire(__filename);\n  "use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports.service = service;\n\nasync function service() {\n  return Promise.resolve(\'service\');\n}\n  ',
  }
    ;

  var exports = {};

  var __filename = 'index.js';
  var internalGlobal = typeof global !== 'undefined' ? global : window;
  var __require__ = internalGlobal.__createRequire(__filename);
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports['default'] = void 0;

  var _index = _interopRequireDefault(__require__('./util/index'));

  var _index2 = __require__('./service/index');

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, 'prototype', { writable: false }); return Constructor; }

  var LowcodeComponent = /*#__PURE__*/function () {
    function LowcodeComponent() {
      _classCallCheck(this, LowcodeComponent);
    }

    _createClass(LowcodeComponent, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        // service()
        console.log('mount1231231323', (0, _index['default'])());
      }
    }, {
      key: 'testFunc',
      value: function testFunc() {
        console.log('test function');
      }
    }]);

    return LowcodeComponent;
  }();

  exports['default'] = LowcodeComponent;
  

  this.$ss = exports;
  this.$ss.index = exports;
  return exports;
}

const exp = __initExtra();
console.log(exp.default.prototype.componentDidMount());