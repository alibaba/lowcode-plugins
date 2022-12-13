import { useState } from 'react';
import enUS from './locale/en-US.json';
import zhCN from './locale/zh-CN.json';
import { ILowCodePluginContext } from '@alilc/lowcode-engine';
import { IconZh } from './icons/zh';
import { IconEn } from './icons/en';
import './index.less';

const PluginZhEn = (ctx: ILowCodePluginContext) => {
  const { editorCabin, utils } = ctx.common;
  const { intl } = utils.createIntl({
    'en-US': enUS,
    'zh-CN': zhCN,
  });
  const { globalLocale, Tip } = editorCabin;
  const ZhEn = () => {
    const [locale, setLocale] = useState(globalLocale.getLocale());
    globalLocale.onChangeLocale((localeValue: string) => {
      setLocale(localeValue);
      window.location.reload();
    });
    const isZh = (locale === 'zh-CN');
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
  };

  return {
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
      });
    },
  };
};

PluginZhEn.pluginName = 'PluginZhEn';

export default PluginZhEn;
