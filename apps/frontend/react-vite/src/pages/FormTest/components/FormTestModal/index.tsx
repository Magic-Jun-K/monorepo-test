import { Input, Modal, Select, Upload } from '@eggshell/unocss-ui';

interface Props {
  visible: boolean;
  onCancel: () => void;
}
export default function FormTestModal(props: Props) {
  const { visible, onCancel } = props;

  return (
    <Modal
      title="测试表单模态框"
      open={visible}
      onCancel={onCancel}
      width={800}
      styles={{ body: { height: 600, overflowY: 'auto' } }}
    >
      <Input />
      <Select
        options={[
          { label: '选项1', value: '1' },
          { label: '选项2', value: '2' },
        ]}
      />
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">图片卡片模式</h3>
        <Upload
          accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx"
          multiple
          listType="picture-card"
          // onChange={}
        />
        <p className="mt-2 text-gray-500">支持上传图片、PDF和Word文档，可以多选或拖拽上传</p>
        <p className="text-blue-500 mt-1">
          <span className="i-carbon-information mr-1"></span>
          上传成功后，点击文件可以预览，右上角按钮可以删除
        </p>
      </div>
    </Modal>
  );
}
