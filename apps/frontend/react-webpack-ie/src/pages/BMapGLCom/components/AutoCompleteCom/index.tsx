import { AutoComplete } from '@eggshell/unocss-ui-ie';

export default () => {
  return (
    <AutoComplete
      options={[
        { label: '北京', value: 'bj' },
        { label: '上海', value: 'sh' },
        { label: '广州', value: 'gz' },
        { label: '广州2', value: 'gz' },
        { label: '广州3', value: 'gz' },
        { label: '深圳', value: 'sz' },
        { label: '成都', value: 'cd' },
        { label: '重庆', value: 'cq' },
        { label: '西安', value: 'xa' },
        { label: '武汉', value: 'wh' }
      ]}
      filterOption={(input, option) => (typeof option.label === 'string' ? option.label.includes(input) : false)}
      allowClear
      placeholder="请输入地址"
      style={{ width: '400px' }}
    />
  );
};
