import React, { Component } from 'react';
import { common } from '@alilc/lowcode-engine';
import { intl } from '../locale';
import { OutlineMain } from '../main';
import TreeView from './tree';
import './style.less';
import { IEditor } from '@alilc/lowcode-types';
import Filter from './filter';

const { editorCabin } = common;
const { observer } = editorCabin;

@observer
export class OutlinePane extends Component<{ config: any }> {
  private main = new OutlineMain(this.props.config.name || this.props.config.pluginKey);

  componentWillUnmount() {
    this.main.purge();
  }

  render() {
    const tree = this.main.currentTree;

    if (!tree) {
      return (
        <div className="lc-outline-pane">
          <p className="lc-outline-notice">{intl('Initializing')}</p>
        </div>
      );
    }

    return (
      <div className="lc-outline-pane">
        <Filter tree={tree} />
        <div ref={(shell) => this.main.mount(shell)} className="lc-outline-tree-container">
          <TreeView key={tree.id} tree={tree} />
        </div>
      </div>
    );
  }
}
