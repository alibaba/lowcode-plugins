import {
  isVariableDeclaration,
  isCallExpression,
  Identifier,
} from '@babel/types';

export function isRequireExpression(node: any) {
  return (
    isVariableDeclaration(node) &&
    isCallExpression(node.declarations[0]?.init) &&
    (node.declarations[0].init.callee as Identifier).name === 'require'
  );
}

export function getRequireTarget(node: any): string {
  return node.declarations?.[0]?.init?.arguments?.[0]?.value;
}
