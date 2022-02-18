import React from 'react';

import './ErrorTip.less';

export interface ErrorTipProps {
  errorInfo: string;
}

export const ErrorTip = ({ errorInfo }: ErrorTipProps) => {
  return (
    <div className="plugin-code-editor-errorTip">
      {errorInfo}
    </div>
  );
};
