// @todo schema default
import React, { PureComponent } from 'react';
import { createForm, registerValidateRules, Form as FormilyForm } from '@formily/core';
import { createSchemaField } from '@formily/react';
import {
  Space,
  Form,
  FormCollapse,
  FormLayout,
  FormItem,
  ArrayItems,
  Input,
  Switch,
  NumberPicker,
  Select,
} from '@formily/next';
import _isPlainObject from 'lodash/isPlainObject';
import _thru from 'lodash/thru';
import _isArray from 'lodash/isArray';
import _cloneDeep from 'lodash/cloneDeep';
import _mergeWith from 'lodash/mergeWith';
import _get from 'lodash/get';
import traverse from 'traverse';

import {
  ParamValue,
  JSFunction,
  Code,
  ComponentSwitchBtn,
  FormLazyObj,
  LowcodeExpression,
} from '../Forms';
import { generateClassName } from '../../utils/misc';
import { filterXDisplay } from '../../utils/filter-x-display';

import { DataSourceFormProps, DataSourceFormMode } from '../../types';
import { isJSExpression } from '@alilc/lowcode-types';

const SCHEMA = {
  type: 'object',
  properties: {
    type: {
      title: '类型',
      type: 'string',
      editable: false,
      readOnly: true,
      hidden: true,
      display: 'hidden',
      visible: false,
      'x-decorator': 'FormItem',
      'x-component-props': {
        // labelWidth: 300,
      },
    },
    id: {
      type: 'string',
      title: '数据源 ID',
      required: true,
    },
    isInit: {
      title: '是否自动请求',
      type: 'boolean',
      default: true,
      'x-decorator-props': {
        addonAfter: <ComponentSwitchBtn component="LowcodeExpression" />,
      },
    },
    options: {
      type: 'object',
      title: '请求配置',
      required: true,
      properties: {
        uri: {
          type: 'string',
          title: '请求地址',
          required: true,
          'x-decorator-props': {
            addonAfter: <ComponentSwitchBtn component="LowcodeExpression" />,
          },
        },
        params: {
          title: '请求参数',
          type: 'array',
          default: [],
          'x-decorator-props': {
            addonAfter: <ComponentSwitchBtn component="LowcodeExpression" />,
          },
        },
        method: {
          type: 'string',
          title: '请求方法',
          required: true,
          enum: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'].map((i) => ({
            label: i,
            value: i,
          })),
          'x-component': 'Select',
          default: 'GET',
          'x-decorator-props': {
            addonAfter: <ComponentSwitchBtn component="LowcodeExpression" />,
          },
        },
        isCors: {
          type: 'boolean',
          title: '是否支持跨域',
          required: true,
          default: true,
          'x-decorator-props': {
            addonAfter: <ComponentSwitchBtn component="LowcodeExpression" />,
          },
        },
        timeout: {
          type: 'number',
          title: '超时时长（毫秒）',
          default: 5000,
          'x-decorator-props': {
            addonAfter: <ComponentSwitchBtn component="LowcodeExpression" />,
          },
        },
        headers: {
          type: 'array',
          title: '请求头信息',
          default: [],
          'x-decorator-props': {
            addonAfter: <ComponentSwitchBtn component="LowcodeExpression" />,
          },
        },
      },
    },
    lifecycles: {
      type: 'void',
      title: '添加数据处理函数',
      'x-component': 'FormLazyObj',
      'x-component-props': {
        defaultPropertyKeys: [],
        addText: '选择添加',
        autoWidth: false,
      },
      'x-decorator-props': {},
      properties: {
        shouldFetch: {
          type: 'string',
          title: '是否发起请求的计算函数',
          'x-component': 'JSFunction',
          default: {
            type: 'JSFunction',
            value: 'function() { return true; }',
          },
        },
        willFetch: {
          type: 'string',
          title: '请求前对参数的处理函数',
          'x-component': 'JSFunction',
          default: {
            type: 'JSFunction',
            value: 'function(options) { return options; }',
          },
        },
        dataHandler: {
          type: 'string',
          title: '请求成功对结果的处理函数',
          'x-component': 'JSFunction',
          default: {
            type: 'JSFunction',
            value: 'function(res) { return res.data }',
          },
        },
        errorHandler: {
          type: 'string',
          title: '请求失败对异常的处理函数',
          'x-component': 'JSFunction',
          default: {
            type: 'JSFunction',
            value: 'function(err) {}',
          },
        },
      },
    },
  },
};


/**
 * 通过是否存在 ID 来决定读写状态
 */
export class DataSourceForm extends PureComponent<DataSourceFormProps, { form: FormilyForm } > {
  constructor (props) {
    super(props)

    this.state = {
      form: this.createForm()
    }
  }

  createForm(): FormilyForm {
    return createForm({
      initialValues: this.deriveInitialData(this.props.dataSource),
    })
  }

  componentDidUpdate(prevProps: DataSourceFormProps) {
    // dataSource 变了，需要更新 form，界面刷新
    if (this.props.dataSource !== prevProps.dataSource) {
      this.setState({
        form: this.createForm()
      })
    }
  }

  submit = () => {
    return this.state.form
      .submit()
      .then((formData: any) => {
        if (_isArray(_get(formData, 'options.params'))) {
          formData.options.params = formData.options.params.reduce(
            (acc: any, cur: any) => {
              if (!cur.name) return acc;
              acc[cur.name] = cur.value;
              return acc;
            },
            {},
          );
        }
        if (_isArray(_get(formData, 'options.headers'))) {
          formData.options.headers = formData.options.headers.reduce(
            (acc: any, cur: any) => {
              if (!cur.name) return acc;
              acc[cur.name] = cur.value;
              return acc;
            },
            {},
          );
        }
        return formData;
      })
      .catch((err) => {
        console.error('v', err);
        return null;
      });
  };

  deriveInitialData = (dataSource: object = {}) => {
    const { dataSourceType } = this.props;
    const result: any = _cloneDeep(dataSource);
    // TODO
    if (_isPlainObject(_get(result, 'options.params')) && !isJSExpression(_get(result, 'options.params'))) {
      result.options.params = Object.keys(result.options.params).reduce(
        (acc: any, cur: any) => {
          acc.push({
            name: cur,
            value: result.options.params[cur],
          });
          return acc;
        },
        [],
      );
    }
    if (_isPlainObject(_get(result, 'options.headers')) && !isJSExpression(_get(result, 'options.headers'))) {
      result.options.headers = Object.keys(result.options.headers).reduce(
        (acc: any, cur: any) => {
          acc.push({
            name: cur,
            value: result.options.headers[cur],
          });
          return acc;
        },
        [],
      );
    }

    result.type = dataSourceType.type;

    return result;
  };

  deriveSchema = () => {
    const { dataSourceType, dataSourceList = [], mode } = this.props;

    // 添加校验规则
    // TODO 返回对象会报错
    registerValidateRules({
      validateDataSourceId(value, rule) {
        if (dataSourceList?.find((i) => i.id === value)) {
          return rule.message as string;
        }
        return '';
      },
    });

    // @todo 减小覆盖的风险
    const formSchema: any = _mergeWith(
      {},
      SCHEMA,
      dataSourceType.schema,
      (objValue, srcValue) => {
        if (_isArray(objValue)) {
          return srcValue;
        }
      },
    );

    // 过滤 x-display 值为隐藏的属性
    filterXDisplay(formSchema);

    if (mode === DataSourceFormMode.CREATE) {
      formSchema.properties.id['x-validator'] = {
        validateDataSourceId: true,
        message: '该数据源已存在',
      };
    }

    if (_get(formSchema, 'properties.options.properties.params')) {
      formSchema.properties.options.properties.params = {
        ...formSchema.properties.options.properties.params,
        type: 'array',
        'x-component': 'ArrayItems',
        'x-component-props': {
          className: generateClassName('array-items'),
        },
        'x-decorator': 'FormItem',
        items: {
          type: 'object',
          // 'x-component': 'Space',
          properties: {
            space: {
              type: 'void',
              'x-component': 'Space',
              properties: {
                sort: {
                  type: 'void',
                  'x-decorator': 'FormItem',
                  'x-component': 'ArrayItems.SortHandle',
                },
                name: {
                  title: '',
                  type: 'string',
                  'x-component': 'Input',
                  'x-component-props': {
                    placeholder: 'name',
                    style: {
                      width: '80px',
                    },
                  },
                  'x-decorator-props': {
                    addonAfter: ':',
                  },
                },
                value: {
                  title: '',
                  // type: "string",
                  'x-component': 'ParamValue',
                  'x-component-props': {
                    types: ['string', 'boolean', 'expression'],
                    placeholder: 'value',
                  },
                },
                remove: {
                  type: 'void',
                  'x-decorator': 'FormItem',
                  'x-component': 'ArrayItems.Remove',
                },
              },
              },
            },
          },
        properties: {
          addition: {
            type: 'void',
            title: '添加',
            'x-component': 'ArrayItems.Addition',
            'x-component-props': {
              style: {
                width: '120',
              },
            },
          },
        },
      };
    }
    if (_get(formSchema, 'properties.options.properties.headers')) {
      formSchema.properties.options.properties.headers = {
        ...formSchema.properties.options.properties.headers,
        type: 'array',
        'x-component': 'ArrayItems',
        'x-component-props': {
          className: generateClassName('array-items'),
        },
        items: {
          type: 'object',
          'x-component': 'Space',
          properties: {
            sort: {
              type: 'void',
              'x-decorator': 'FormItem',
              'x-component': 'ArrayItems.SortHandle',
            },
            name: {
              title: '',
              type: 'string',
              'x-component': 'Input',
              'x-component-props': {
                placeholder: 'name',
                style: {
                  width: '80px',
                },
              },
              'x-decorator-props': {
                addonAfter: ':',
              },
            },
            value: {
              title: '',
              // type: "string",
              'x-component': 'ParamValue',
              'x-component-props': {
                types: ['string', 'boolean', 'expression'],
                // placeholder: "value",
              },
            },
            remove: {
              type: 'void',
              'x-decorator': 'FormItem',
              'x-component': 'ArrayItems.Remove',
            },
          },
        },
        properties: {
          addition: {
            type: 'void',
            title: '添加',
            'x-component': 'ArrayItems.Addition',
            'x-component-props': {
              style: {
                width: '120',
              },
            },
          },
        },
      };
      // delete formSchema.properties.options.properties.headers.properties;
    }

    return {
      type: 'object',
      properties: {
        layout: {
          type: 'void',
          'x-component': 'FormLayout',
          'x-component-props': {
            labelCol: 6,
            wrapperCol: 14,
            // layout: 'vertical'
          },
          properties: traverse(formSchema).forEach((node) => {
            if (node?.type && !node['x-component']) {
              if (node.type === 'string') {
                node['x-component'] = 'Input';
              } else if (node.type === 'number') {
                node['x-component'] = 'NumberPicker';
              } else if (node.type === 'boolean') {
                node['x-component'] = 'Switch';
                node['x-component-props'] = {
                  size: 'small',
                  // labelWidth: 300,
                  style: {
                    width: '50px',
                  },
                };
              }
            }
            if (
              node &&
              node['x-component'] &&
              node['x-component'].indexOf('FormCollapse') === -1 &&
              node['x-component'].indexOf('ArrayItems.') === -1
            ) {
              node['x-decorator'] = 'FormItem';
            }
          }).properties,
        },
      },
    };
  };

  render() {
    const SchemaField = createSchemaField({
      components: {
        Input,
        Switch,
        NumberPicker,
        FormItem,
        ArrayItems,
        FormLayout,
        FormCollapse,
        JSFunction,
        Code,
        ParamValue,
        LowcodeExpression,
        Space,
        FormLazyObj,
        Select,
      },
    });

    return (
      <div className={generateClassName('create')}>
        <Form form={this.state.form}>
          <SchemaField
            schema={_thru(this.deriveSchema(), (arg) => {
              return arg;
            })}
          />
        </Form>
      </div>
    );
  }
}
