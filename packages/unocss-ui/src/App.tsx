import { Button } from './components/Button';
import { AutoComplete } from './components/AutoComplete';
import { Menu } from './components/Menu';
import { Dropdown } from './components/Dropdown';
import type { MenuItemType } from './components/Menu/types';
import { Upload } from './components/Upload';
// import './utils/myCall';
// import './utils/myApply';
// import './utils/myBind';

import './App.css';

// 在检查前定义 menuConfig
const menuConfig: MenuItemType[] = [
  {
    type: 'item',
    itemKey: 'dashboard',
    label: '仪表盘'
  },
  {
    type: 'submenu',
    itemKey: 'settings',
    label: '系统设置',
    children: [
      {
        type: 'item',
        itemKey: 'account',
        label: '账户管理'
      },
      {
        type: 'submenu',
        itemKey: 'security',
        label: '安全设置',
        children: [
          {
            type: 'item',
            itemKey: 'password',
            label: '密码修改'
          }
        ]
      }
    ]
  },
  {
    type: 'group',
    itemKey: 'help',
    label: '帮助中心',
    children: [
      {
        type: 'item',
        itemKey: 'help-docs',
        label: '文档中心'
      }
    ]
  }
];

function App() {
  return (
    <div className="w-full h-full">
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
        filterOption={(input, option) =>
          typeof option.label === 'string' ? option.label.includes(input) : false
        }
        allowClear
        placeholder="请输入城市"
        style={{ width: '400px' }}
      />
      <Dropdown overlay={<Menu mode="vertical" items={menuConfig} />}>
        <Button>测试下拉菜单</Button>
      </Dropdown>
      {/* <Upload>
        <Button type="primary">上传文件</Button>
      </Upload> */}
      <div className="p-4 w-120">
        <h2 className="text-xl font-bold mb-4">文件上传测试</h2>
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">图片卡片模式</h3>
          <Upload 
            accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx" 
            multiple 
            listType="picture-card"
            onChange={(info) => {
              console.log('上传状态变化:', info.file.status, info.fileList);
              
              // 根据不同的上传状态显示不同的消息
              if (info.file.status === 'uploading') {
                console.log(`${info.file.name} 正在上传中...`);
              } else if (info.file.status === 'done') {
                console.log(`${info.file.name} 上传成功！`);
              } else if (info.file.status === 'error') {
                console.log(`${info.file.name} 上传失败！`);
              }
            }}
          />
          <p className="mt-2 text-gray-500">支持上传图片、PDF和Word文档，可以多选或拖拽上传</p>
          <p className="text-blue-500 mt-1"><span className="i-carbon-information mr-1"></span>上传成功后，点击文件可以预览，右上角按钮可以删除</p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">文本列表模式</h3>
          <Upload 
            accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx" 
            multiple 
            listType="text"
            onChange={(info) => {
              if (info.file.status === 'done') {
                console.log(`${info.file.name} 上传成功！`);
              }
            }}
          />
          <p className="mt-2 text-gray-500">点击文件名可以查看文件内容，右侧按钮可以删除文件</p>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">图片列表模式</h3>
          <Upload 
            accept="image/*,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx" 
            multiple 
            listType="picture"
            onChange={(info) => {
              if (info.file.status === 'done') {
                console.log(`${info.file.name} 上传成功！`);
              }
            }}
          />
          <p className="mt-2 text-gray-500">适合图片上传，点击图片可以查看大图</p>
        </div>
      </div>
    </div>
  );
}
export default App;
