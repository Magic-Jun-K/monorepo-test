// import { useEffect } from 'react';
import { Button } from '@common/ui';

import treeIcon from '@/assets/images/test/car_jf.svg';
import One from '@/assets/images/test/one.png';

export default () => {
  return (
    <div>
      <h1>首页</h1>
      <Button>测试按钮</Button>
      <img src={treeIcon} alt="" />
      <img src={One} alt="" />
    </div>
  );
};
