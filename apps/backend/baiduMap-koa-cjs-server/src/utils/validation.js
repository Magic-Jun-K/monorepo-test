/**
 * 验证上传的图片文件
 * @param {Object} file - 文件对象
 * @returns {string|null} - 返回错误信息或null
 */
const validateImage = (file) => {
  if (!file) {
    return 'No file uploaded';
  }
  
  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!validTypes.includes(file.mimetype)) {
    return 'Invalid file type';
  }
  
  return null; // No errors
};

module.exports = { validateImage };