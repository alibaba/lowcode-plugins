const CURRENT_LANGUAGE = ((window as any).locale || window.localStorage.getItem('vdev-locale') || '').replace(/_/, '-') || 'zh-CN';
const index = CURRENT_LANGUAGE === 'en-US' ? 1: 0

export const WORDS = {
  title: ['源码编辑', 'Source Editor'][index],
  save: ['保存', 'Save'][index],
  functionParseError: ['部分函数解析出错，其内容无法保存，请重新编辑后关闭面板以保存。', 'A(n) error occurred parsing functions. Your modification cannot be saved, please review your code, modify it, click close button to save again.'][index],
  generalParseError: ['当前的代码解析出错，代码内容将无法保存，请重新编辑后关闭面板以保存。', 'A(n) error occurred parsing code. Your modification cannot be saved, please review your code, modify it, click close button to save again.'][index],
  irreparableState: ['当前 Schema 中 State 数据格式无法恢复，请手工订正！', 'State cannot be parsed from current schema automatically. Please correct schema manually.'][index],
  saveSuccess: ['源码保存成功！', 'Source code successfully saved!'][index],
} as const
