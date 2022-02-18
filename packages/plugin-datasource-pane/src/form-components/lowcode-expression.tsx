import React, { PureComponent } from 'react';
import { connect } from '@formily/react';
import _noop from 'lodash/noop';
import { JSExpression } from '@alilc/lowcode-types';
import { EditorContext } from '../utils/editor-context';
import { generateClassName } from '../utils/misc';

export interface LowcodeExpressionProps {
  className: string;
  value: JSExpression;
  onChange?: (val: JSExpression) => void;
}


export class LowcodeExpressionComp extends PureComponent<LowcodeExpressionProps> {
  static isFieldComponent = true;

  static defaultProps = {
    onChange: _noop,
  };


  handleChange = (newValue: JSExpression) => {
    this.props?.onChange?.(newValue);
  };

  render() {
    const { value } = this.props;
    return (
      <div>
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
