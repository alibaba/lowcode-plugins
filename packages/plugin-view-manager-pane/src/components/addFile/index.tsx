import { Balloon } from '@alifd/next';
import * as React from 'react';
import { observer } from 'mobx-react';
import { AddIcon } from '../../icon';
import { IOptions } from '../..';

import './index.scss';
import { intl } from '../../locale';

function AddFileComponent(props: { options: IOptions }) {
  if (!props.options?.onAddPage && !props.options?.onAddComponent) {
    return null;
  }

  return (
    <>
      <Balloon
        v2
        trigger={
          <span>
            <AddIcon />
          </span>
        }
        triggerType="click"
        align="bl"
        popupClassName="view-pane-popup"
        closable={false}
      >
        {props.options.onAddPage ? (
          <div
            onClick={(e) => {
              props.options.onAddPage?.();
            }}
            className="view-pane-popup-item"
          >
            {intl('view_manager.components.addFile.CreatePage')}
          </div>
        ) : null}

        {props.options.onAddComponent ? (
          <div
            className="view-pane-popup-item"
            onClick={(e) => {
              props.options.onAddComponent?.();
            }}
          >
            {intl('view_manager.components.addFile.CreateAComponent')}
          </div>
        ) : null}
      </Balloon>
    </>
  );
}

export const AddFile = observer(AddFileComponent);
