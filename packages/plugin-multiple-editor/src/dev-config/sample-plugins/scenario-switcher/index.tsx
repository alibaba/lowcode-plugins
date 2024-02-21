import React from 'react';
import { Select } from '@alifd/next';
import scenarios from '../../universal/scenarios.json';
import { IPublicModelPluginContext } from '@alilc/lowcode-types';
const { Option } = Select;

const getCurrentScenarioName = () => {
  // return 'index'
  const list = location.href.split('/');
  return list[list.length - 1].replace('.html', '');
}

function Switcher(props: any) {
  return (<Select
    id="basic-demo"
    onChange={(val) => location.href = `./${val}.html`}
    defaultValue={getCurrentScenarioName()}
    style={{ width: 220 }}
  >
    {
      scenarios.map((scenario: any) => <Option value={scenario.name}>{scenario.title}</Option>)
    }
  </Select>)
}

export const scenarioSwitcher = (ctx: IPublicModelPluginContext) => {
  return {
    name: 'scenarioSwitcher',
    async init() {
      const { skeleton } = ctx;

      skeleton.add({
        name: 'scenarioSwitcher',
        area: 'topArea',
        type: 'Widget',
        props: {
          align: 'right',
          width: 80,
        },
        content: Switcher,
      });
    },
  };
};
scenarioSwitcher.pluginName = 'scenarioSwitcher';