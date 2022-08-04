import { init } from '@alilc/lowcode-engine';
import registerPlugins from './universal/plugin';
import './universal/global.scss';


const preference = new Map();
preference.set('DataSourcePane', {
  importPlugins: [],
  dataSourceTypes: [
    {
      type: 'fetch',
      schema: {
        type: "object",
        properties: {
          id: {
            type: "string"
          },
          type: {
            type: "string"
          },
          isInit: {
            type: "boolean",
          },
          options: {
            type: "object",
            properties: {
              method: {
                type: "string",
              },
              isCors: {
                type: "boolean",
              },
              timeout: {
                type: "number",
              },
              uri: {
                type: "string",
              },
            },
            required: ["method", "isCors", "timeout", "uri"]
          }
        },
        required: ["id", "type", "isInit", "options"]
      }
    },
    {
      type: 'jsonp',
    }
  ]
});

(async function main() {
  await registerPlugins();

  init(document.getElementById('lce-container')!, {
    // designMode: 'live',
    // locale: 'zh-CN',
    enableCondition: true,
    enableCanvasLock: true,
    // 默认绑定变量
    supportVariableGlobally: true,
    // simulatorUrl 在当 engine-core.js 同一个路径下时是不需要配置的！！！
    // 这里因为用的是 unpkg，在不同 npm 包，engine-core.js 和 react-simulator-renderer.js 是不同路径
    simulatorUrl: [
      'https://alifd.alicdn.com/npm/@alilc/lowcode-react-simulator-renderer@beta/dist/css/react-simulator-renderer.css',
      'https://alifd.alicdn.com/npm/@alilc/lowcode-react-simulator-renderer@beta/dist/js/react-simulator-renderer.js'
    ]
  }, preference);
})();
