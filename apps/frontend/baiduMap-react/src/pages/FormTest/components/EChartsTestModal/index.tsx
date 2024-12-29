import React from 'react';
import { Modal } from '@common/ui';

import EChartsCom from '@/pages/EChartsCom';

interface Props {
  visible: boolean;
  onCancel: () => void;
}
export default (props: Props) => {
  const { visible, onCancel } = props;

  return (
    <Modal title="测试ECharts模态框" isOpen={visible} onClose={onCancel}>
      <EChartsCom />
    </Modal>
  );
};
