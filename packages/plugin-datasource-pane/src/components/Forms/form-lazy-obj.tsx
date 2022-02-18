import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Button, MenuButton } from '@alifd/next';
import { FormLayout, FormItem } from '@formily/next';
import type { VoidField } from '@formily/core';
import {
  createSchemaField,
  useForm,
  useField,
  useFieldSchema,
  observer,
} from '@formily/react';
import _pick from 'lodash/pick';
import { JSFunction } from '.';
import { RemoveBtn } from './form-lazy-obj-remove-btn';
import { generateClassName } from '../../utils/misc';

const { Item: MenuButtonItem } = MenuButton;

export interface FormLazyObjProps {
  addText: string;
  defaultPropertyKeys: string[];
}

export const FormLazyObj = observer((props: FormLazyObjProps) => {
  const { addText = '添加' } = props;
  const field = useField<VoidField>();
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const schema = useFieldSchema();
  const form = useForm();
  useEffect(() => {}, [field]);
  const properties = useMemo(() => {
    return Object.keys(schema.properties)
      .filter((i) => selectedProperties.indexOf(i) === -1)
      .map((propertyKey) => ({
        label: schema.properties[propertyKey].title,
        value: propertyKey,
      }));
  }, [schema, selectedProperties]);

  const handleAdd = useCallback((propertyKey) => {
    setSelectedProperties((selectedProperties) => selectedProperties.concat(propertyKey));
  }, []);

  const handleRemove = useCallback((propertyKey) => {
    setSelectedProperties((selectedProperties) => selectedProperties.filter((i) => i !== propertyKey));
  }, []);

  const addition = useMemo(() => {
    if (properties.length === 0) return null;
    if (properties.length === 1) {
      return (
        <Button onClick={handleAdd.bind(this, properties[0].value)}>
          {addText}
        </Button>
      );
    }
    return (
      <MenuButton label={addText} onItemClick={handleAdd}>
        {properties.map((prop) => (
          <MenuButtonItem key={prop.value}>{prop.label}</MenuButtonItem>
        ))}
      </MenuButton>
    );
  }, [properties, addText]);

  const content = useMemo(() => {
    const SchemaField = createSchemaField({
      // TODO
      components: { JSFunction, FormLayout, FormItem },
    });
    const schemaJSON = schema.toJSON();
    const properties = _pick(schemaJSON.properties, selectedProperties);
    return (
      <SchemaField
        schema={{
          ...schemaJSON,
          type: 'void',
          'x-component': 'FormLayout',
          'x-component-props': {},
          properties: Object.keys(properties).reduce((acc, cur) => {
            acc[cur] = {
              ...properties[cur],
              'x-decorator-props': {
                labelCol: 24,
                labelAlign: 'left',
                wrapperCol: 24,
                layout: 'vertical',
                // TODO not work
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
