import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Button, MenuButton } from '@alifd/next';
import { FormLayout, FormItem } from '@formily/next';
import type { VoidField } from '@formily/core';
import {
  createSchemaField,
  useField,
  useFieldSchema,
  observer,
} from '@formily/react';
import _pick from 'lodash/pick';
import { JSFunction } from './jsFunction';
import { RemoveBtn } from './form-lazy-obj-remove-btn';
import { generateClassName } from '../../utils/misc';
import { isJSFunction } from '@alilc/lowcode-types';

const { Item: MenuButtonItem } = MenuButton;

export interface FormLazyObjProps {
  addText: string;
  defaultPropertyKeys: string[];
}

export const FormLazyObj = observer((props: FormLazyObjProps) => {
  const { addText = '添加' } = props;

  const field = useField<VoidField>();

  const schema = useFieldSchema();

  const [selectedProperties, setSelectedProperties] = useState<string[]>(() => {
    // 自动回填数据处理函数
    return Object.keys(schema.properties || {}).filter(property => {
      return isJSFunction(field.form.values[property])
    })
  });

  const properties = useMemo(() => {
    return Object.keys(schema.properties || {})
      .filter((i) => selectedProperties.indexOf(i) === -1)
      .map((propertyKey) => ({
        label: schema.properties?.[propertyKey].title,
        value: propertyKey,
      }));
  }, [schema, selectedProperties]);

  const handleAdd = useCallback((propertyKey) => {
    setSelectedProperties((selectedProperties) => selectedProperties.concat(propertyKey));
  }, []);

  /* 改成formily内部支持 */
  const handleRemove = useCallback((propertyKey) => {
    field?.form?.query(propertyKey)?.take()?.setState((state) => {
      state.visible = !state.visible;
    });
    // setSelectedProperties((selectedProperties) =>
    //   selectedProperties.filter((i) => i !== propertyKey)
    // );
  }, [field]);

  const addition = useMemo(() => {
    if (properties.length === 0) return null;
    if (properties.length === 1) {
      return (
        <Button onClick={() => handleAdd(properties[0].value)}>
          {addText}
        </Button>
      );
    }
    return (
      <MenuButton label={addText} onItemClick={handleAdd} autoWidth={false}>
        {properties.map((prop) => (
          <MenuButtonItem key={prop.value}>{prop.label}</MenuButtonItem>
        ))}
      </MenuButton>
    );
  }, [properties, addText, handleAdd]);

  const content = useMemo(() => {
    const SchemaField = createSchemaField({
      // TODO
      components: { JSFunction, FormLayout, FormItem },
    });
    const schemaJSON = schema.toJSON();
    const schemaProperties = _pick(schemaJSON.properties, selectedProperties);

    return (
      <SchemaField
        schema={{
          ...schemaJSON,
          type: 'void',
          'x-component': 'FormLayout',
          'x-component-props': {},
          properties: Object.keys(schemaProperties).reduce((acc, cur) => {
            acc[cur] = {
              ...schemaProperties[cur],
              'x-decorator-props': {
                labelCol: 24,
                labelAlign: 'left',
                wrapperCol: 24,
                layout: 'vertical',
                wrapperStyle: {
                  justifyContent: 'space-bewteen',
                  alignItems: 'flex-start',
                },
                addonAfter: (
                  <RemoveBtn propertyKey={cur} onClick={handleRemove} />
                ),
              },
            };
            return acc;
          }, {}),
        }}
      />
    );
  }, [schema, selectedProperties, handleRemove]);

  return (
    <div className={generateClassName('form-lazy-obj')}>
      {addition}
      {content}
    </div>
  );
});

FormLazyObj.displayName = 'ArrayCollapse';

export default FormLazyObj;
