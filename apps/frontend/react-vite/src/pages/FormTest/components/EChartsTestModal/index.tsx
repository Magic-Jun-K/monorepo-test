import { Modal } from '@eggshell/unocss-ui';
// import { Modal } from 'antd';

import EChartsCom from '@/components/echarts';
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
