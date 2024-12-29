import { useState } from 'react';
import { Button } from '@common/ui';

import ImageTestModal from './components/ImageTestModal';
import FormTestModal from './components/FormTestModal';
import EChartsTestModal from './components/EChartsTestModal';

export default () => {
  const [isOpenImage, setIsOpenImage] = useState(false); // 是否打开ECharts模态框
  const [isOpenECharts, setIsOpenECharts] = useState(false); // 是否打开ECharts模态框
  const [isOpenForm, setIsOpenForm] = useState(false); // 是否打开表单模态框

  return (
    <div>
      <h1>表单测试页</h1>
      <Button variant="primary" onClick={() => setIsOpenImage(true)}>
        图片测试按钮
      </Button>
      <Button variant="primary" onClick={() => setIsOpenECharts(true)}>
        ECharts测试按钮
      </Button>
      <Button variant="primary" onClick={() => setIsOpenForm(true)}>
        表单测试按钮
      </Button>
      <ImageTestModal visible={isOpenImage} onCancel={() => setIsOpenImage(false)} />
      <FormTestModal visible={isOpenForm} onCancel={() => setIsOpenForm(false)} />
      <EChartsTestModal visible={isOpenECharts} onCancel={() => setIsOpenECharts(false)} />
    </div>
  );
};
