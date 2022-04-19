import * as React from 'react';

import { common, project, config, event } from '@alilc/lowcode-engine';
import { Loading, Box } from '@alifd/next';

import { default as BlockCard } from '../card';
import { default as store } from '../store';

import './index.scss';

const { useState, useEffect } = React;

const DEFAULT_SCREENSHOT = 'https://tianshu.alicdn.com/19307bb5-2881-44ad-82d3-f92e2f44aabb.png';

function checkBlockAPI() {
  const apiList = config.get('apiList') || {};
  const { block: blockAPI } = apiList;

  if (!blockAPI?.listBlocks) {
    throw new Error('[BlockPane] block api required in engine config.');
  }

  return blockAPI;
}

export interface Block {

}

export interface BlockResponse {
  code: number;
  data: Block[];
}

export interface BlockPaneAPI {
  listBlocks: () => BlockResponse;
}

export interface BlockPaneProps {
  api: BlockPaneAPI
}

export const BlockPane = (props: BlockPaneProps) => {
  const { listBlocks } = checkBlockAPI();
  const [ blocks, setBlocks ] = useState();
  useEffect(() => {
    const fetchBlocks = async () => {
      const res = await listBlocks();
      store.init(res);
      setBlocks(res);
    };
    event.on('common:BlockChanged', () => {
      fetchBlocks();
    })
    fetchBlocks();

  }, []);

  const registerAdditive = (shell: HTMLDivElement | null) => {
    console.log('shell: ', shell);
    if (!shell || shell.dataset.registered) {
      return;
    }

    function getSnippetId(elem: any) {
      if (!elem) {
        return null;
      }
      while (shell !== elem) {
        console.log('elem.classList; ', elem.classList);
        if (elem.classList.contains('snippet')) {
          return elem.dataset.id;
        }
        elem = elem.parentNode;
      }
      return null;
    }

    const _dragon = common.designerCabin.dragon
    console.log('_dragon: ', _dragon);
    if (!_dragon) {
      return;
    }

    // eslint-disable-next-line
    const click = (e: Event) => {};

    shell.addEventListener('click', click);

    _dragon.from(shell, (e: Event) => {
      const doc = project.getCurrentDocument();
      const id = getSnippetId(e.target);
      console.log('doc: ', doc);
      console.log('id: ', id);
      if (!doc || !id) {
        return false;
      }

      console.log('store.get(id): ', store.get(id));

      const dragTarget = {
        type: 'nodedata',
        data: store.get(id),
      };

      return dragTarget;
    });

    shell.dataset.registered = 'true';
  };

  if (!blocks?.length) {
    return <div className='block-pane-loading'><Loading /></div>
  }

  return <div className='block-pane' ref={registerAdditive}><Box direction='row' wrap>
      {
        blocks.map(item => <BlockCard id={item.id} title={item.title} screenshot={item.screenshot || DEFAULT_SCREENSHOT} />)
      }
    </Box>
    </div>;
} 

export default BlockPane;