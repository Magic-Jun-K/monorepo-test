/**
 * 图片模型
 * 定义图片在数据库中的结构和方法
 */
const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tags: [{
    type: String,
  }],
  metadata: {
    width: Number,
    height: Number,
    format: String,
  },
}, {
  timestamps: true,
});

// 添加索引以提高查询性能
imageSchema.index({ filename: 1 });
imageSchema.index({ tags: 1 });
imageSchema.index({ uploadedBy: 1 });

// 添加实例方法
imageSchema.methods.getPublicUrl = function() {
  return `/uploads/${this.filename}`;
};

// 添加静态方法
imageSchema.statics.findByTag = function(tag) {
  return this.find({ tags: tag });
};

module.exports = mongoose.model('Image', imageSchema);
