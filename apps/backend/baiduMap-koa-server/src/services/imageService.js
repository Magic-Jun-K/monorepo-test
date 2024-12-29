const sharp = require('sharp');

/**
 * 处理图片（压缩、添加水印等）
 * @param {Object} file - 文件对象
 * @returns {Promise<Object>} - 返回处理后的图片信息
 */
async function processImage(file) {
  const processedImage = await sharp(file.path)
    .resize(800)
    .toFile(`./public/images/${file.originalname}`);
  return {
    filename: processedImage.filename,
    path: processedImage.path,
    metadata: processedImage.metadata,
  };
}

module.exports = { processImage };
