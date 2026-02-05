import { Modal } from '@eggshell/ui-unocss-ie';

import EChartsCom from '@/pages/EChartsCom';

interface Props {
  visible: boolean;
  onCancel: () => void;
}
export default (props: Props) => {
  const { visible, onCancel } = props;

  return (
    <Modal title="测试ECharts模态框" visible={visible} onCancel={onCancel}>
      <EChartsCom />
    </Modal>
  );
};
