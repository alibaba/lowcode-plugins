import React, { PureComponent } from 'react';
import { Button, Icon } from '@alifd/next';
import _get from 'lodash/get';
import { connect, mapProps } from '@formily/react';
import cn from 'classnames';
import { generateClassName } from '../../utils/misc';

export interface ComponentSwitchBtnCompProps {
  className?: string;
  style?: React.CSSProperties;
  component: string;
  originalComponent: string;
  setComponent: (component: string) => void;
}

export interface ComponentSwitchBtnCompState {
  currentComponent: string;
}

class ComponentSwitchBtnCompComp extends PureComponent<
  ComponentSwitchBtnCompProps,
  ComponentSwitchBtnCompState
> {
  static isFieldComponent = true;

  static defaultProps = {};

  state: ComponentSwitchBtnCompState = {
    currentComponent: this.props.originalComponent,
  };

  private originalComponent = null;

  componentDidMount() {
    this.originalComponent = this.props.originalComponent;
  }

  handleSwitch = () => {
    let nextComponent = null;
    if (this.state.currentComponent === this.originalComponent) {
      nextComponent = this.props.component;
    } else {
      nextComponent = this.originalComponent;
    }
    this.setState({ currentComponent: nextComponent });
    this.props.setComponent?.(nextComponent);
  };

  render() {
    const { className, style } = this.props;
    return (
      <Button
        className={cn(generateClassName('component-switchbtn'), className)}
        style={style}
        text
        onClick={this.handleSwitch}
      >
        <Icon type="set" />
      </Button>
    );
  }
}

export const ComponentSwitchBtn = connect(
  ComponentSwitchBtnCompComp,
  mapProps((props, field) => {
    return {
      setComponent: field.setComponent,
      originalComponent: _get(field, 'component[0]'),
    };
  }),
);
