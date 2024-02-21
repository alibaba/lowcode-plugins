import { common } from '@alilc/lowcode-engine';
import enUS from './en-US.json';
import zhCN from './zh-CN.json';

const { intl } = common?.utils?.createIntl?.({
  'en-US': enUS,
  'zh-CN': zhCN,
}) || {
  intl: (id) => {
    return zhCN[id];
  }
};

export { intl };
