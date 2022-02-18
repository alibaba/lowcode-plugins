import { PureComponent } from 'react';
import { ILowCodePluginContext, common } from '@alilc/lowcode-engine';
import { PluginProps } from '@alilc/lowcode-types';
import { intl } from './locale';
import { IconZh } from './icons/zh';
import { IconEn } from './icons/en';
import './index.less';

const { editorCabin } = common;
const { globalLocale, Tip } = editorCabin;

class ZhEn extends PureComponent<PluginProps> {
  static displayName = 'LowcodeZhEn';

  state = {
    locale: globalLocale.getLocale(),
  };

  private dispose = globalLocale.onChangeLocale((locale) => {
    this.setState({
      locale,
    });
    window.location.reload();
  });

  componentWillUnmount() {
    this.dispose();
  }

  render() {
    const isZh = this.state.locale === 'zh-CN';
    return (
      <div
        className="lowcode-plugin-zh-en"
        onClick={() => {
          globalLocale.setLocale(isZh ? 'en-US' : 'zh-CN');
        }}
      >
        {isZh ? <IconEn size={20} /> : <IconZh size={20} />}
        <Tip direction="right">{intl('To Locale')}</Tip>
      </div>
    );
  }
}

const plugin = (ctx: ILowCodePluginContext) => {
  return {
    // 插件名，注册环境下唯一
    name: 'PluginZhEn',
    // 依赖的插件（插件名数组）
    dep: [],
    // 插件的初始化函数，在引擎初始化之后会立刻调用
    init() {
      // 往引擎增加面板
      ctx.skeleton.add({
        area: 'leftArea',
        type: 'Widget',
        name: 'zhEn',
        content: ZhEn,
        contentProps: {},
        props: {
          align: 'bottom',
        },
      })
    },
  };
};

plugin.pluginName = 'PluginZhEn'

export default plugin
