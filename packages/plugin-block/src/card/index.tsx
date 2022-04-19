import * as React from 'react';

import './index.scss';

const { useState, useEffect } = React;

interface BlockCardProps {
  id: string;
  title: string;
  screenshot: string;
}

const BlockCard = (props: BlockCardProps) => {
  const { id, title, screenshot='https://tianshu.alicdn.com/19307bb5-2881-44ad-82d3-f92e2f44aabb.png' } = props;

  return <div className='block-card snippet' data-id={id}>
    <div className='block-card-screenshot'>
      <img src={screenshot} />
    </div>
    <span>
      {title}
    </span>
  </div>;
};

export default BlockCard;