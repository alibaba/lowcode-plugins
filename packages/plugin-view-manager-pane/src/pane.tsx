import * as React from 'react';
import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { ResourcePaneContent } from './components/resourceTree';
import { AddFile } from './components/addFile';
import { CloseIcon } from './icon';
import { Behaviors } from './components/addFile/behaviors';
import { IOptions } from '.';
import { intl } from './locale';

export function Pane(props: {
  pluginContext: IPublicModelPluginContext;
  options: IOptions;
}) {
  React.useEffect(() => {
    props.options?.init?.(props.pluginContext);
  }, []);

  return (
    <div
      className="workspace-view-pane"
      onClick={() => {
        props.options.handleClose?.();
      }}
    >
      <div
        className="workspace-view-pane-content"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="workspace-view-pane-top">
          <span className="workspace-view-pane-title">
            {intl('view_manager.src.pane.View')}
          </span>
          <div>
            <span className="workspace-view-pane-top-icon">
              <AddFile options={props.options} />
            </span>
            <span
              onClick={() => {
                props.options.handleClose?.();
              }}
              className="workspace-view-pane-top-icon"
            >
              <CloseIcon />
            </span>
          </div>
        </div>
        <ResourcePaneContent
          defaultExpandAll={true}
          pluginContext={props.pluginContext}
          behaviors={(behaviorsProps: any) => {
            return <Behaviors {...behaviorsProps} options={props.options} />;
          }}
          options={props.options}
        />
      </div>
    </div>
  );
}
