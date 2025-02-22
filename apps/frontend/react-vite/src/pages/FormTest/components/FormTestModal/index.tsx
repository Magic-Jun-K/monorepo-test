import { Input, Modal, Select } from '@eggshell/unocss-ui';

interface Props {
  visible: boolean;
  onCancel: () => void;
}
export default function FormTestModal(props: Props) {
  const { visible, onCancel } = props;

  return (
    <Modal
      title="测试表单模态框"
      visible={visible}
      onCancel={onCancel}
    >
      <Input />
      <Select options={[{ label: '选项1', value: '1' }, { label: '选项2', value: '2' }]} />
    </Modal>
  );
};
