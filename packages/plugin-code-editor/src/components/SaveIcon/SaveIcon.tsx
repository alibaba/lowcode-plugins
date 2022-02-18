import React from 'react';
import { Button } from '@alifd/next';

import { WORDS } from '../../config';

import './SaveIcon.less';

export interface ErrorTipProps {
  onClick: () => void;
  isDisabled?: boolean;
}

export const SaveIcon = ({ isDisabled, onClick }: ErrorTipProps) => {
  return (
    <div
      className={
        `plugin-code-editor-save-icon ${
          isDisabled
          ? 'plugin-code-editor-save-icon--disabled'
          : ''
        }`
      }
    >
      <Button onClick={onClick} size='small'>
        {WORDS.save}
      </Button>
    </div>
  );
};
