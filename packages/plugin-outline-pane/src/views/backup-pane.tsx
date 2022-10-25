import { PureComponent } from 'react';
import { PluginProps } from '@alilc/lowcode-types';
import { OutlinePane } from './pane';

export const Backup = Symbol.for('backup-outline');

export class OutlineBackupPane extends PureComponent<PluginProps> {
  render() {
    return (
      <OutlinePane
        config={{
          name: Backup,
        }}
      />
    );
  }
}
