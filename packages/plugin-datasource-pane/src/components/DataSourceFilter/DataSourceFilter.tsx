import React, { PureComponent } from 'react';
import { Search } from '@alifd/next';
import { DataSourceType } from '../../types';
import { generateClassName } from '../../utils/misc';

export interface DataSourceFilterProps {
  dataSourceTypes: DataSourceType[];
  onFilter?: (dataSourceType: string, keyword: string) => void;
}

export interface DataSourceFilterState {
  selectedDataSourceType: string;
  keyword: string;
}

export class DataSourceFilter extends PureComponent<
  DataSourceFilterProps,
  DataSourceFilterState
> {
  state = {
    selectedDataSourceType: '',
    keyword: '',
  };

  // TODO onFilterChange 类型定义和实际不符
  handleSearchFilterChange = (filterObj: Record<string, any>) => {
    // const { keyword } = this.state;
    const { onFilter } = this.props;
    // TODO 所以这里转换为 string
    this.setState(
      { selectedDataSourceType: filterObj as unknown as string },
      () => {
        const { keyword, selectedDataSourceType } = this.state;
        onFilter?.(keyword, selectedDataSourceType);
      },
    );
  };

  handleChange = (val: string, actionType, item: string) => {
    if (item === 'clear') {
      this.handleSearch('');
    }
  };

  handleSearch = (keyword: string) => {
    const { selectedDataSourceType } = this.state;
    const { onFilter } = this.props;
    onFilter?.(selectedDataSourceType, keyword);
    this.setState({ keyword }, () => {
      const { keyword, selectedDataSourceType } = this.state;
      onFilter?.(keyword, selectedDataSourceType);
    });
  };

  render() {
    const { dataSourceTypes } = this.props;
    const { selectedDataSourceType } = this.state;

    return (
      <div className={generateClassName('filters')}>
        <Search
          hasClear
          onChange={this.handleChange}
          onSearch={this.handleSearch}
          filterProps={{}}
          defaultFilterValue={selectedDataSourceType}
          filter={[
            {
              label: '全部',
              value: '',
            },
          ].concat(
            dataSourceTypes.map((type) => ({
              label: type?.type,
              value: type?.type,
            })),
          )}
          onFilterChange={this.handleSearchFilterChange}
        />
      </div>
    );
  }
}
