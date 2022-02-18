import React, { PureComponent } from 'react';
import { MenuButton, Button, Icon, Select, Input, Radio, NumberPicker, Switch } from '@alifd/next';
import { connect } from '@formily/react';
import _isPlainObject from 'lodash/isPlainObject';
import _isArray from 'lodash/isArray';
import _isNumber from 'lodash/isNumber';
import _isBoolean from 'lodash/isBoolean';
import cn from 'classnames';
import { EditorContext } from '../utils/editor-context';
import { generateClassName, safeParse } from '../utils/misc';
import { JSONComp } from './json';
import './param-value.scss';

const { Group: RadioGroup } = Radio;

type ParamValueType = 'string' | 'number' | 'boolean' | 'expression' | 'jsonstring' | 'json';

export interface ParamValueProps {
  className?: string;
  style?: React.CSSProperties;
  value: any;
  onChange?: (value: any) => void;
  types: ParamValueType[];
}

export interface ParamValueState {
  type: ParamValueType;
  value: string | number | { type: 'JSFunction'; value: string } | boolean;
}

const TYPE_LABEL_MAP = {
  string: '字符串',
  number: '数字',
  boolean: '布尔',
  expression: '表达式',
  jsonstring: '对象字符串',
  json: '对象',
};

class ParamValueComp extends PureComponent<ParamValueProps, ParamValueState> {
  static isFieldComponent = true;

  static defaultProps = {
    types: ['string', 'boolean', 'number', 'expression', 'jsonstring', 'json'],
    className: '',
    style: {},
  };

  state: ParamValueState = {
    type: 'string',
    value: '',
  };

  constructor(props: ParamValueProps) {
    super(props);
    this.state.value = this.props.value;
    this.state.type = this.getTypeFromValue(this.props.value);
  }

  // @todo
  getTypeFromValue = (value: any) => {
    if (_isBoolean(value)) {
      return 'boolean';
    } else if (_isNumber(value)) {
      return 'number';
    } else if (_isPlainObject(value) && value.type === 'JSExpression') {
      return 'expression';
    }
    return 'string';
  };

  // @todo 需要再 bind 一次？
  handleChange = (value: any) => {
    this.setState({
      value,
    });
    this.props?.onChange?.(value);
  };

  handleTypeChange = (nextType?: string) => {
    const { types } = this.props;
    const { type } = this.state;
    let nextRealType = nextType;
    let nextValue = this.props.value || '';
    if (!nextRealType) {
      const currentTypeIndex = this.props.types.indexOf(type);
      nextRealType = types[(currentTypeIndex + 1) % types.length];
    }
    if (nextRealType === 'string') {
      nextValue = nextValue.toString();
    } else if (nextRealType === 'number') {
      nextValue *= 1;
    } else if (nextRealType === 'boolean') {
      nextValue = nextValue === 'true' || nextValue && nextValue.value === 'true' || false;
    } else if (nextRealType === 'expression') {
      // ExpressionSetter 的 value 接受 string
      nextValue = String(nextValue);
    } else if (nextRealType === 'jsonstring') {
      nextValue = '';
    } else if (nextRealType === 'object') {
      nextValue = safeParse(nextValue);
    }
    this.setState(
      {
        type: nextRealType as ParamValueType,
        value: nextValue,
      },
    );
    this.props.onChange?.(nextValue);
  };

  renderTypeSwitch = () => {
    const handleSwitch = () => {
      this.handleTypeChange();
    };
    const handleSwitchTo = (type) => {
      this.handleTypeChange(type);
    };
    /* return (
      <Button text onClick={handleClick}><Icon type="switch" /></Button>
    ); */
    return (
      <Button.Group className={generateClassName('universal-value-typeswitch')}>
        <Button onClick={handleSwitch}><Icon type="switch" /></Button>
        <MenuButton size="small" type="secondary" onItemClick={handleSwitchTo}>
          {this.props.types.map(
            (item) => <MenuButton.Item key={item}>{TYPE_LABEL_MAP[item]}</MenuButton.Item>,
          )}
        </MenuButton>
      </Button.Group>
    );
  };

  renderTypeSelect = () => {
    const { type } = this.state;
    const { types } = this.props;

    if (_isArray(types) && types.length > 2) {
      return (
        <Select
          followTrigger
          className="param-value-type"
          dataSource={types.map((item) => ({
            label: TYPE_LABEL_MAP[item],
            value: item,
          }))}
          value={type}
          onChange={this.handleTypeChange}
        />
      );
    }
    if (_isArray(types) && types.length > 1) {
      return (
        <RadioGroup
          className="param-value-type"
          shape="button"
          size="small"
          onChange={this.handleTypeChange}
          value={type}
        >
          {types.map((item) => (
            <Radio value={item}>TYPE_LABEL_MAP[item]</Radio>
          ))}
        </RadioGroup>
      );
    }
    return null;
  };

  render() {
    const { className, style } = this.props;
    const { type, value } = this.state;
    return (
      <div className={cn(generateClassName('universal-value'), className)} style={style}>
        {/* this.renderTypeSelect() */}
        {type === 'string' && <Input className={generateClassName('universal-value-string')} onChange={this.handleChange} value={value} />}
        {type === 'boolean' && <Switch className={generateClassName('universal-value-boolean')} onChange={this.handleChange} checked={value} />}
        {type === 'number' && <NumberPicker className={generateClassName('universal-value-number')} onChange={this.handleChange} value={value} />}
        {type === 'jsonstring' && <span className={generateClassName('universal-value-jsonstring')}><JSONComp onChange={this.handleChange} value={safeParse(value)} /></span>}
        {type === 'json' && <span className={generateClassName('universal-value-json')}><JSONComp onChange={this.handleChange} value={value} /></span>}
        {type === 'expression' && (
          <span className={generateClassName('universal-value-json')}>
            <EditorContext.Consumer>
              {({ setters }) => {
                const ExpressionSetter = setters?.getSetter('ExpressionSetter').component;
                if (!ExpressionSetter) return null;
                return (
                  <ExpressionSetter
                    className={generateClassName('universal-value-expression')}
                    onChange={this.handleChange}
                    field={{
                      setters,
                    }}
                    value={value}
                  />
                );
              }}
            </EditorContext.Consumer>
          </span>
        )}
        {this.renderTypeSwitch()}
      </div>
    );
  }
}

export const ParamValue = connect(ParamValueComp);
