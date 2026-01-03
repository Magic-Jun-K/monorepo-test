import { Modal } from '@eggshell/antd-ui';

import treeIcon from '@/assets/images/test/car_jf.svg';
// import TreeIcon from '@/assets/images/test/car_jf.svg?react';
import One from '@/assets/images/test/one.png';

interface Props {
  visible: boolean;
  onCancel: () => void;
}
export default (props: Props) => {
  const { visible, onCancel } = props;

  return (
    <Modal
      title="图片测试模态框"
      open={visible}
      onCancel={onCancel}
      width={800}
      styles={{ body: { height: 600 } }}
    >
      <img src={treeIcon} alt="" />
      {/* <TreeIcon /> */}
      <img src={One} alt="" />
    </Modal>
  );
};