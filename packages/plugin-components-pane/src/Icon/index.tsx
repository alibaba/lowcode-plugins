import React from 'react';
import cls from 'classnames/bind';
import Svg from './icon.svg';
import style from './index.module.scss';

const cx = cls.bind(style);

export default function Icon() {
  return (
    <div className={cx('icon')}>
      <Svg />
    </div>
  );
}
