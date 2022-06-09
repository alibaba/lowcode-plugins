import React from 'react';
import { NumberPicker, Icon } from '@alifd/next';
import { ILowCodePluginContext, project, material } from '@alilc/lowcode-engine';

import './index.scss';

const isNewEngineVersion = !!material;

const devices = [
  { key: 'desktop' },
  { key: 'tablet' },
  { key: 'phone' },
];

const CustomIcon = Icon.createFromIconfontCN({
  scriptUrl: 'https://at.alicdn.com/t/font_2896595_33xhsbg9ux5.js',
});

export class SimulatorPane extends React.Component {
  static displayName = 'SimulatorPane';

  state = {
    actived: 'desktop',
    currentWidth: null
  };

  componentDidMount() {
    if (isNewEngineVersion) {
      project.onSimulatorRendererReady(() => {
        const currentWidth = document.querySelector('.lc-simulator-canvas')?.clientWidth || this.state.currentWidth || 0;
        this.setState({
          currentWidth
        });
      });
    } else {
      // 兼容老版本引擎
      // @ts-ignore
      project.onRendererReady(() => {
        const currentWidth = document.querySelector('.lc-simulator-canvas')?.clientWidth || this.state.currentWidth || 0;
        this.setState({
          currentWidth
        });
      });
    }
  }

  change = (device: string) => {
    const simulator = project.simulator;
    // 切换画布
    simulator?.set('device', device);
    if (document.querySelector('.lc-simulator-canvas')?.style) {
      document.querySelector('.lc-simulator-canvas').style.width = null;
    }
    setTimeout(() => {
      const currentWidth = document.querySelector('.lc-simulator-canvas')?.clientWidth || this.state.currentWidth || 0;
      this.setState({
        actived: device,
        currentWidth
      });
    }, 0);
  }

  renderItemSVG(device: string) {
    switch (device) {
      case 'desktop':
        return <CustomIcon size="large" type="iconic_PC_Select" />;
      case 'tablet':
        return <CustomIcon size="large" type="iconic_Tablet_Select" />;
      case 'phone':
        return <CustomIcon size="large" type="iconic_smartphone" />;
      default:
        return <CustomIcon size="large" type="iconic_PC_Select" />;
    }
  }

  render() {
    const currentWidth = this.state.currentWidth || 0;
    return (
      <div className="lp-simulator-pane">
        {
          devices.map((item, index) => {
            return (
              <span
                key={item.key}
                className={`lp-simulator-pane-item ${this.state.actived === item.key ? 'actived' : ''}`}
                onClick={this.change.bind(this, item.key)}
              >
                {this.renderItemSVG(item.key)}
              </span>
            )
          })
        }
        <div className='lp-simulator-width-setter'>
          <NumberPicker className="lp-simulator-width-input" addonTextAfter="px" value={currentWidth} placeholder="请输入" onChange={(value) => {
            this.setState({
              currentWidth: value
            });
          }} onPressEnter={(event: any) => {
            const value = event?.target?.value;
            if (document.querySelector('.lc-simulator-canvas')?.style) {
              document.querySelector('.lc-simulator-canvas').style.width = `${value}px`
            } 
            this.setState({
              currentWidth: value
            });
          }} />
        </div>
      </div>
    );
  }
}
export default (ctx: ILowCodePluginContext) => {
  const simulatorPaneRef = React.createRef<SimulatorPane>();

  return {
    name: 'SimulatorPane',
    // 插件的初始化函数，在引擎初始化之后会立刻调用
    init() {
      // 往引擎增加工具条
      ctx.skeleton.add({
        area: 'top',
        name: 'SimulatorPane',
        type: 'Widget',
        props: {
          description: '切换画布尺寸',
          align: "center",
        },
        content: (
          <SimulatorPane
            ref={simulatorPaneRef}
          />
        ),
      });
    }
  };
};