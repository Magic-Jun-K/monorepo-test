import { Modal } from 'antd';

import treeIcon from '@/assets/images/test/car_jf.svg';
import One from '@/assets/images/test/one.png';

interface Props {
  visible: boolean;
  onCancel: () => void;
}
export default (props: Props) => {
  const { visible, onCancel } = props;

  return (
    <Modal title="图片测试模态框" open={visible} onCancel={onCancel}>
      <img src={treeIcon} alt="" />
      <img src={One} alt="" />
    </Modal>
  );
};
