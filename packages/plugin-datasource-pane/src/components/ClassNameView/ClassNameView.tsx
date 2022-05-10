import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Select } from '@alifd/next';
import { common } from '@alilc/lowcode-engine';

export interface PluginProps {
    value: string;
    onChange: any;
}

export interface ClassNameViewState {
  dataSource: Array<{
    value: string;
    label: string;
  }>;
  selectValue: string[];
}
export default class ClassNameView extends PureComponent<PluginProps, ClassNameViewState> {
    static display = 'ClassNameSetter';

    static propTypes = {
        onChange: PropTypes.func,
        value: PropTypes.string,
    };

    static defaultProps = {
        onChange: () => {},
        value: '',
    };

    getClassNameList = () => {
        const { project } = this.context;
        const schema = project.exportSchema(common.designerCabin.TransformStage.Save);
        const { css } = schema.componentsTree[0];
        const classNameList: string[] = [];
        const re = /\.?\w+[^{]+\{[^}]*\}/g;
        const list = css.match(re);
        list.map((item: string) => {
        if (item[0] === '.') {
            const className = item.substring(1, item.indexOf('{'));
            classNameList.push(className);
        }

        return item;
        });

        return classNameList;
    };


  handleChange = (value: string[]) => {
    const { onChange } = this.props;
    onChange(value.join(' '));
    this.setState({
      selectValue: value,
    });
  };

  // eslint-disable-next-line react/no-deprecated
  componentWillMount() {
    const { value } = this.props;
    const classnameList = this.getClassNameList();
    const dataSource: Array<{
      label: string;
      value: string;
    }> = [];
    classnameList.map((item) => {
      dataSource.push({
        value: item,
        label: item,
      });

      return item;
    });


    let selectValue: string[] = [];
    if (value && value !== '') {
      selectValue = value.split(' ');
    }


    this.setState({
      dataSource,
      selectValue,
    });
  }


  render() {
    const { dataSource, selectValue } = this.state;
    return (
      <Select aria-label="tag mode" mode="tag" dataSource={dataSource} onChange={this.handleChange} value={selectValue} />
    );
  }
}
