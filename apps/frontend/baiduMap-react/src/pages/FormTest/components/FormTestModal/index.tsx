import { Input, Modal } from '@common/ui';
import { ImageUploader } from '@common/antd-ui';

import { imageService } from '@/services/imageService';

interface Props {
  visible: boolean;
  onCancel: () => void;
}
export default (props: Props) => {
  const { visible, onCancel } = props;

  return (
    <Modal
      title="测试表单模态框"
      isOpen={visible}
      onClose={onCancel}
    >
      <Input />
      <ImageUploader imageService={imageService} maxCount={5} onChange={urls => console.log('上传的图片URLs:', urls)} />
    </Modal>
  );
};
