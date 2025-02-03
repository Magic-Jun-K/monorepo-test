// import { Input, Modal } from '@eggshell/ui';
import { ImageUploader } from '@eggshell/antd-ui';
import { Input, Modal } from '@eggshell/unocss-ui';

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
      visible={visible}
      onCancel={onCancel}
    >
      <Input />
      <ImageUploader imageService={imageService} maxCount={5} onChange={(urls: string[]) => console.log('上传的图片URLs:', urls)} />
    </Modal>
  );
};
