import { editorController } from '@/Controller';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';

type Methods = Record<string, { count: number }>;

export function getAllMethodFromSchema() {
  const schema = editorController.getSchema(true);
  const componentData = schema.componentsTree?.[0];
  const methods: Methods = {};
  if (componentData) {
    Object.assign(methods, getMethodFromNode(componentData));
  }
  return methods;
}

function getMethodFromNode(node: any): Methods {
  const methods: Methods = {};
  const mergeIfReference = (obj: any) => {
    if (obj?.value && typeof obj.value) {
      // JSFunction 类型的为this.xxx.apply()
      const matches = obj.value.match(
        /((this\.)\w+(\.apply)?\(.*?\))/g
      ) as string[];
      if (matches?.length) {
        for (const match of matches) {
          // 二次确认
          if (/(this\.)\w+(\.apply)?\(.*?\)/.test(match)) {
            mergeMethod(methods, {
              [match.replace(/(this\.)|((\.apply)?\(.*$)/g, '')]: { count: 1 },
            });
          }
        }
      }
    }
  };

  // 合并一个节点数组，例如 slot 的元素列表
  const mergeNodeList = (list: any[]) => {
    for (const item of list) {
      mergeMethod(methods, getMethodFromNode(item));
    }
  };

  const propsKeys = Object.keys(node?.props || {});
  // 属性和事件
  for (const key of propsKeys) {
    const prop = node.props[key];
    // 处理事件引用
    if (key === '__events' && prop.eventDataList) {
      // 已经在 mergeIfReference 处理了，以下暂时不需要
      // for (const ev of prop.eventDataList) {
      //   mergeMethod(methods, { [ev.relatedEventName]: { count: 1 } });
      // }
    } else {
      // 普通 slot
      if (prop.type === 'JSSlot') {
        mergeNodeList(prop.value || []);
      } else if (prop.type === 'JSFunction') {
        mergeIfReference(prop);
      } else if (isArray(prop)) {
        // 数组类型，可能存在是个 slot 数组
        for (const item of prop) {
          if (isObject(item)) {
            for (const k of Object.keys(item)) {
              const p: any = (item as any)[k];
              if (p.type === 'JSSlot') {
                mergeNodeList(p.value);
              }
            }
          }
        }
      } else {
        // 普通 props
        mergeIfReference(prop);
      }
    }
  }

  // 条件语句
  mergeIfReference(node?.condition);

  // 循环
  mergeIfReference(node.loop);

  // 子元素
  mergeNodeList(node.children || []);

  return methods;
}

// 合并方法，引用次数相加
function mergeMethod(methods: Methods, childMethods: Methods) {
  for (const method of Object.keys(childMethods)) {
    if (!methods[method]) {
      methods[method] = childMethods[method];
    } else {
      methods[method].count += childMethods[method].count;
    }
  }
  return methods;
}
