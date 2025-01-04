/**
 * 创建错误对象
 * @param {number} status - HTTP状态码
 * @param {string} message - 错误信息
 */
function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

module.exports = { createError };
