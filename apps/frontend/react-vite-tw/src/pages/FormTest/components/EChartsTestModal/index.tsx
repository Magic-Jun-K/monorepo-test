import { Modal } from '@eggshell/antd-ui';

import EChartsCom from '@/components/ECharts';
import { PieOptions } from './constant';

const options = PieOptions;

interface Props {
  visible: boolean;
  onCancel: () => void;
}
export default function EChartsTestModal(props: Props) {
  const { visible, onCancel } = props;

  return (
    <Modal
      title="测试ECharts模态框"
      open={visible}
      onCancel={onCancel}
      width={800}
      styles={{ body: { height: 600 } }}
    >
      <EChartsCom options={options} />
    </Modal>
  );
}
