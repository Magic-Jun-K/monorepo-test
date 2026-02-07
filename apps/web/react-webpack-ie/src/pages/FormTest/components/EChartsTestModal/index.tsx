import { Modal } from 'antd';

import EChartsCom from '@/pages/EChartsCom';

interface Props {
  visible: boolean;
  onCancel: () => void;
}
export default (props: Props) => {
  const { visible, onCancel } = props;

  return (
    <Modal title="测试ECharts模态框" open={visible} onCancel={onCancel}>
      <EChartsCom />
    </Modal>
  );
};
