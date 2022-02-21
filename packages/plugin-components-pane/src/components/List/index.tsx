import React from 'react';
import cls from 'classnames/bind';
import style from './index.module.scss';

const cx = cls.bind(style);

interface Props {
  className?: string;
}

export default class List extends React.Component<Props> {
  render() {
    const { className } = this.props;
    return <div className={cls(className, cx('cards'))}>{this.props.children}</div>;
  }
}
