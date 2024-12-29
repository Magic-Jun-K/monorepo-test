const formidable = require('formidable');

/**
 * 上传中间件
 */
const upload = async (ctx, next) => {
  const form = new formidable.IncomingForm();
  
  form.uploadDir = './uploads'; // Specify the uploads directory
  form.keepExtensions = true; // Keep file extensions

  form.parse(ctx.req, (err, fields, files) => {
    if (err) {
      ctx.status = 400; // Bad Request
      ctx.body = { message: 'File upload failed', error: err };
      return;
    }

    ctx.body = {
      fields,
      files,
    };
  });

  await next();
};

module.exports = upload;