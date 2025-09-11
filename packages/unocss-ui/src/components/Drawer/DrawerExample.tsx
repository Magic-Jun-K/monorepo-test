import { useState } from 'react';

import { Button } from '../Button';
import { Drawer } from './Drawer';

function Example() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleOk = () => {
    // 处理确定逻辑
    setDrawerOpen(false);
  };
  const handleCancel = () => {
    // 处理取消逻辑
    setDrawerOpen(false);
  };
  return (
    <>
      <Button className="mt-4" onClick={() => setDrawerOpen(true)}>
        打开抽屉
      </Button>
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="演示 Drawer 组件"
        placement="right"
        width={600}
        showFooter={true}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <div className="p-4">这里是 Drawer 内容，可以放表单、菜单等。</div>
      </Drawer>
    </>
  );
}
export default Example;
