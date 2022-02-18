import React from 'react';
import { Button, Icon } from '@alifd/next';
// import { connect, mapProps } from '@formily/react';

export interface RemoveBtnProps {
  onClick?: (propertyKey: string) => void;
  propertyKey: string;
}

export function RemoveBtn(props: RemoveBtnProps) {
  const { onClick, propertyKey } = props;

  const handleClick = () => {
    onClick?.(propertyKey);
  };

  return (
    <Button style={{ color: 'grey' }} text onClick={handleClick}><Icon type="delete-filling" /></Button>
  );
}

// TODO
RemoveBtn.isFieldComponent = true;
