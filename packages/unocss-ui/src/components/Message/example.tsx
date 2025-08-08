import React from 'react';

import { message } from './index';

const MessageExample: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const showSuccess = () => {
    messageApi.success('This is a success message');
  };

  const showError = () => {
    messageApi.error('This is an error message');
  };

  const showStaticSuccess = () => {
    messageApi.success('This is a static success message');
  };

  return (
    <div>
      {contextHolder}
      <button onClick={showSuccess}>Show Success Message (Hook)</button>
      <button onClick={showError}>Show Error Message (Hook)</button>
      <button onClick={showStaticSuccess}>Show Success Message (Static)</button>
    </div>
  );
};

export default MessageExample;