import * as React from 'react';
import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { ResourcePaneContent } from './components/resourceTree';
import { Behaviors } from './components/addFile/behaviors';
import { IOptions } from '.';

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
    >
      <div
        className="workspace-view-pane-content"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
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
