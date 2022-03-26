import React, { PureComponent } from 'react';
import { connect } from '@formily/react';
import { JSExpression } from '@alilc/lowcode-types';
import _noop from 'lodash/noop';
import { EditorContext } from '../../utils/editor-context';
import { generateClassName } from '../../utils/misc';

export interface LowcodeExpressionProps {
  className: string;
  value: JSExpression;
  onChange?: (val: JSExpression) => void;
}

// export interface LowcodeExpressionState {}

export class LowcodeExpressionComp extends PureComponent<LowcodeExpressionProps> {
  static isFieldComponent = true;

  static defaultProps = {
    onChange: _noop,
  };


  handleChange = (newValue: JSExpression) => {
    this.props?.onChange?.(newValue);
  };

  render() {
    const { value, className } = this.props;
    return (
      <div className={className}>
        <EditorContext.Consumer>
          {({ setters }) => {
            const ExpressionSetter = setters?.getSetter('ExpressionSetter').component;
            if (!ExpressionSetter) return null;
            return (
              <ExpressionSetter
                className={generateClassName('lowcode-expression')}
                onChange={this.handleChange}
                field={{
                  setters,
                }}
                value={value}
              />
            );
          }}
        </EditorContext.Consumer>
      </div>
    );
  }
}

export const LowcodeExpression = connect(LowcodeExpressionComp);
