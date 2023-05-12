import { fileMapToTree } from '../src/utils/files';

const fileMap = {
  'index.js':
    'import util from \'./util/index\';\nimport { service } from \'./service/index\';\n\nexport default class LowcodeComponent extends Component {\n constructor() { console.log(service) }\n  componentDidMount() {\n    service()\n    console.log(\'mount1231231323\', util());\n  }\n  componentWillUnmount() {\n    console.log(\'unmount\');\n  }\n  testFunc() {\n    console.log(\'test function\');\n  }\n}',
  'index.css': '',
  'util/index.js':
    'import {common} from \'./common\';\n\nexport default function util() {\n  return `${common()}-456`;\n}',
  'util/common.js': 'export function common() {\n  return 123;\n}',
  'service/index.js':
    'export async function service() {\n  return Promise.resolve(\'service\');\n}',
};

console.log(fileMapToTree(fileMap));
