interface Expr {
  type: string;
  value: string | number;
  extType?: string;
}

type ExprType = Expr | string;

function getExprStr(expr: ExprType) {
  if (typeof expr === 'string') {
    return expr;
  }
  return expr && (expr as Expr).value;
}

function getEvalExpressionStr(expr: ExprType): string | undefined {
  const exprStr = getExprStr(expr);
  if (exprStr == undefined) {
    return exprStr;
  } else if (exprStr === '') {
    return undefined;
  }
  return `(function(){return (${exprStr})}).call($scope)`;
}

export function evaluate(expr: ExprType) {
  const evalExprStr = getEvalExpressionStr(expr);
  const code = `with($scope || {}) { return ${evalExprStr} }`;
  const fn = new Function('$scope', code);
  // 暂时不传递 $scope
  return fn();
}
