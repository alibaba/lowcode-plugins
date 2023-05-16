// @ts-ignore
import prettier from 'prettier/esm/standalone.mjs';
import parserBabel from 'prettier/parser-babel';
import parserPostcss from 'prettier/parser-postcss';

// JS格式化配置
const prettierJsConfig = {
  plugins: [parserBabel],
  parser: 'babel',
  tabWidth: 2, // 缩进2个字符
  printWidth: 120, // 超过120个字符强制换行
  quoteProps: 'preserve', // 对象key保留引号
  singleQuote: true, //字符串使用单引号
  semi: true, // 行尾强制添加分号
  trailingComma: 'all', // 强制数组和对象的结尾添加逗号
  arrowParens: 'avoid', // 箭头函数单参数时省略括号：x => x
};
// CSS格式化配置
const prettierCssConfig = {
  plugins: [parserPostcss],
  parser: 'css',
  tabWidth: 2, // 缩进2个字符
  printWidth: 120, // 超过120个字符强制换行
};

export const initCode = (componentSchema: any | undefined) => {
  return (
    (componentSchema as any)?.originCode ||
    `export default class LowcodeComponent extends Component {
  state = {
    name: "code plugin",
  }
  componentDidMount() {
    console.log('mount');
  }
  componentWillUnmount() {
    console.log('unmount');
  }
  testFunc() {
    console.log('test function');
  }
}`
  );
};

// 格式化JS
export const beautifyJs = (input: string, options: any): string => {
  if (options !== false && input) {
    try {
      input = prettier.format(input, {
        ...prettierJsConfig,
        ...options,
      });
      // 去掉结尾的换行，以兼容未格式时的场景
      input = input.substring(0, input.length - 1);
    } catch (e) {
      console.log(e);
    }
  }
  return input ? input : '';
};

// 格式化CSS
export const beautifyCSS = (input: string, options: any): string => {
  if (options !== false && input) {
    input = prettier.format(input, {
      ...prettierCssConfig,
      ...options,
    });
  }
  return input ? input : '';
};

// schema转换为CSS代码
export const schema2CssCode = (schema: any, prettierOptions: any) => {
  return beautifyCSS(schema.componentsTree[0]?.css || '', prettierOptions);
};
