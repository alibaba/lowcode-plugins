
import { js_beautify, css_beautify } from 'js-beautify';
import { isJSExpression, ProjectSchema, RootSchema, JSFunction, JSExpression } from '@alilc/lowcode-types';
import { Dialog } from '@alifd/next';
import { IState } from '../types';
import { defaultStateCode, WORDS } from '../config';

const js_beautify_config = { indent_size: 2, indent_empty_lines: true, e4x: true };

const initCode = (componentSchema: RootSchema | undefined) => {
  const code = `class LowcodeComponent extends Component {
    ${initStateCode(componentSchema)}
    ${initLifeCycleCode(componentSchema)}
    ${initMethodsCode(componentSchema)}
  }`;

  return js_beautify(code, js_beautify_config);
};

export const schema2JsCode = (schema: ProjectSchema) => {
  const componentSchema = schema.componentsTree[0];
  const code = componentSchema?.originCode ?? initCode(componentSchema);

  // console.log('当前的code：', code);
  return code;
};

export const schema2CssCode = (schema: ProjectSchema) => {
  return beautifyCSS(schema.componentsTree[0]?.css);
};

export const beautifyCSS = (input?: string): string => {
  return input ? css_beautify(input, { indent_size: 2 }) : ''
}

function initStateCode(componentSchema: RootSchema | undefined) {
  if (componentSchema?.state) {
    let states: Record<string, any> = {};
    let needNotice = false;
    Object.keys(componentSchema.state).forEach((item) => {
      const state = componentSchema.state?.[item];
      if (typeof state === 'object' && isJSExpression(state)) {
        states[item] = (state as IState).originCode || state.value; // 兼容历史数据
        if (!(state as IState).originCode) {
          needNotice = true;
        }
      } else {
        states[item] = state; // 兼容历史数据
      }
    });
    if (needNotice) {
      Dialog.alert({
        title: WORDS.title,
        content: WORDS.irreparableState,
      });
    }
    return `state = ${JSON.stringify(states)}`;
  }

  return defaultStateCode;
}

function initLifeCycleCode(componentSchema: RootSchema | undefined) {
  if (componentSchema?.lifeCycles) {
    const { lifeCycles } = componentSchema;
    const codeList = [];

    for (const key in lifeCycles) {
      codeList.push(createFunctionCode(key, lifeCycles[key]));
    }

    return codeList.join('');
  } else {
    return '';
  }
}

function initMethodsCode(componentSchema: RootSchema | undefined) {
  if (componentSchema?.methods && Object.keys(componentSchema.methods).length) {
    const { methods } = componentSchema;
    const codeList = [];

    for (const key in methods) {
      codeList.push(createFunctionCode(key, methods[key]));
    }

    return codeList.join('');
  } else {
    return `
      // 你可以在这里编写函数，并且与组件的事件进行绑定，支持JSX语法
      testFunc() {
        console.log('test aliLowcode func');
        return (
          <div className="test-aliLowcode-func">
        {this.state.test}
      </div>
        );
      }
    `;
  }
}

function createFunctionCode(functionName: string, functionNode: JSFunction | JSExpression) {
  if (functionNode?.type === 'JSExpression' || functionNode?.type === 'JSFunction') {
    // 读取原始代码
    let functionCode = functionNode.originalCode;
    if (functionCode) {
      functionCode = functionCode.replace(/function/, '');
    } else {
      // 兼容历史数据
      functionCode = functionNode.value?.replace(/function/, functionName);
    }
    return functionCode;
  }
}
