/**
 * 面板上下文
 */
import React from 'react';
import { createStateService } from './stateMachine';
import {
  DataSourceType,
} from '../types';

export interface IDataSourcePaneContext {
  stateService: any;
  dataSourceTypes: DataSourceType[];
}


export const DataSourcePaneContext = React.createContext<IDataSourcePaneContext>({
  stateService: createStateService(),
  dataSourceTypes: [],
});
