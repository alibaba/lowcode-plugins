import React from 'react';
import cls from 'classnames/bind';
import style from './index.module.scss';

const cx = cls.bind(style);

interface Props {
  className?: string;
  children?: React.ReactNode;
}

interface State {
  active: number;
  offset: number;
}

export default class Tab extends React.Component<Props, State> {
  static Item;

  state: State = {
    active: 0,
    offset: 0,
  };

  menus = React.createRef<HTMLDivElement>();

  componentDidMount() {
    const offset = this.getIndicatorPos();
    // eslint-disable-next-line
    this.setState({ offset });
  }

  getIndicatorPos = (index?: number) => {
    const { active } = this.state;

    index = typeof index === 'undefined' ? active : index;

    const dom = this.menus.current;
    if (dom) {
      const children = dom.childNodes;

      const target = children[index] as HTMLDivElement;

      if (!target) {
        return 0;
      }

      return target.offsetLeft;
    }
    return 0;
  };

  format = () => {
    const { children } = this.props;
    const childs = React.Children.toArray(children);
    const menus = [];
    for (let i = 0; i < childs.length; i += 1) {
      const { props } = childs[i] as React.ReactElement;
      menus.push({
        title: props?.title,
        index: i,
        children: props.children,
      });
    }

    return {
      menus,
    };
  };

  handleSelect = (active) => {
    this.setState({
      active,
      offset: this.getIndicatorPos(active),
    });
  };

  render() {
    const { active, offset } = this.state;
    const { className } = this.props;

    const { menus } = this.format();

    return (
      <div className={cls(className, cx('tab'))}>
        <div className={cx('header')}>
          <div className={cx('indicator')} style={{ left: offset }} />
          <div className={cx('items')} ref={this.menus}>
            {menus.map((menu) => {
              return (
                <div
                  key={menu.index}
                  className={cx('item', { active: active === menu.index })}
                  onClick={() => this.handleSelect(menu.index)}
                >
                  {menu.title}
                </div>
              );
            })}
          </div>
        </div>
        <div className={cx('tabs')}>
          <div
            className={cx('contents')}
            style={{
              transform: `translate3d(-${active}00%, 0, 0)`,
            }}
          >
            {menus.map(({ children, index }) => {
              return (
                <div className={cx('content', { active: active === index })} key={index}>
                  {children}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

Tab.Item = function TabItem({ children }) {
  return children;
};
