import React from 'react';

import { useMessage } from './useMessage';

const MessageTest: React.FC = () => {
  const [messageApi, contextHolder] = useMessage();

  const showSuccess = () => {
    messageApi.success('This is a success message');
  };

  const showError = () => {
    messageApi.error('This is an error message');
  };

  const showWarning = () => {
    messageApi.warning('This is a warning message');
  };

  const showInfo = () => {
    messageApi.info('This is an info message');
  };

  const showLoading = () => {
    const hide = messageApi.loading('This is a loading message');
    // 模拟异步操作
    setTimeout(hide, 3000);
  };

  const showSuccessWithConfig = () => {
    messageApi.success({
      content: 'This is a success message with config',
      duration: 5,
      className: 'custom-success-message'
    });
  };

  const showOpenMessage = () => {
    messageApi.open({
      type: 'success',
      content: 'This is an open message',
      duration: 3
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Message 组件测试</h1>
      {contextHolder}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={showSuccess}
        >
          Show Success
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={showError}
        >
          Show Error
        </button>
        <button
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          onClick={showWarning}
        >
          Show Warning
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={showInfo}
        >
          Show Info
        </button>
        <button
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          onClick={showLoading}
        >
          Show Loading
        </button>
        <button
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          onClick={showSuccessWithConfig}
        >
          Success with Config
        </button>
        <button
          className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
          onClick={showOpenMessage}
        >
          Open Message
        </button>
      </div>
      <div className="bg-gray-100 p-4 rounded">
        <p>点击上面的按钮来测试不同的消息类型。</p>
      </div>
    </div>
  );
};
export default MessageTest;
