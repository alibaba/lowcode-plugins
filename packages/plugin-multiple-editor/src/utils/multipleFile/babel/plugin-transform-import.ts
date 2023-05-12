import type { PluginObj } from '@babel/core';
import {
  // isImportDefaultSpecifier,
  // ImportSpecifier,
  identifier,
  Identifier,
} from '@babel/types';
// import template from "@babel/template";

// const getVarName = (source: string) =>
//   `$$${source.replace(/(^\d)|([\.\+\-\/])/g, "_")}`;

export default function pluginTransformImport(): PluginObj {
  return {
    visitor: {
      // ImportDeclaration(path, state) {
      //   let iDefault;
      //   let imports: string[] = [];
      //   path.node.specifiers.forEach((id) => {
      //     if (isImportDefaultSpecifier(id)) {
      //       iDefault = id.local.name;
      //     } else {
      //       imports.push((id as ImportSpecifier).local.name);
      //     }
      //   });
      //   const source = path.node.source.value;
      //   let tpl = `var ${getVarName(source)} = __require__('${source}')`;
      //   if (iDefault) {
      //     tpl = `${tpl}\nvar ${iDefault} = ${getVarName(source)}.default;`;
      //   }
      //   if (imports.length) {
      //     imports.forEach((i) => {
      //       tpl = `${tpl}\nvar ${i} = ${getVarName(source)}.${i};`;
      //     });
      //   }
      //   path.replaceWithMultiple(template(tpl)() as any);
      // },
      CallExpression(path) {
        if ((path.node.callee as Identifier).name === 'require') {
          path.node.callee = identifier('__require__');
        }
      },
    },
  };
}
