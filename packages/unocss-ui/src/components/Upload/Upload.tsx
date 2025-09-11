/**
 * @file Upload.tsx
 * @description 文件上传组件
 */
import { forwardRef, useState, useRef, useEffect, DragEvent } from 'react';
import { clsx } from 'clsx';

import { UploadProps, UploadFile, UploadComponentType } from './types';

// Dragger 子组件
export const Dragger = forwardRef<HTMLDivElement, UploadProps>((props, ref) => {
  return <Upload {...props} ref={ref} className={clsx('upload-dragger', props.className)} />;
});

Dragger.displayName = 'Upload.Dragger';

const UploadForwardRef = forwardRef<HTMLDivElement, UploadProps>(
  (
    {
      name = 'file',
      accept,
      multiple = false,
      directory = false,
      disabled = false,
      listType = 'text',
      showUploadList = true,
      defaultFileList = [],
      fileList,
      maxCount,
      children,
      className,
      onChange,
      onRemove,
      beforeUpload,
      onDrop,
      customRequest,
      ...props
    },
    ref
  ) => {
    const [internalFileList, setInternalFileList] = useState<UploadFile[]>(
      fileList || defaultFileList || []
    ); // 内部状态，用于管理文件列表
    const [isDragging, setIsDragging] = useState(false); // 拖拽状态
    const inputRef = useRef<HTMLInputElement>(null); // 输入框的引用
    const dropRef = useRef<HTMLDivElement>(null); // 拖拽区域的引用
    const internalFileListRef = useRef<UploadFile[]>(fileList || defaultFileList || []); // 内部状态，用于管理文件列表

    // 同步外部fileList
    useEffect(() => {
      if (fileList) {
        setInternalFileList(fileList);
        internalFileListRef.current = fileList;
      }
    }, [fileList]);

    // 处理文件上传
    const handleUpload = async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const newFiles: UploadFile[] = [];

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        // 确保file不为undefined
        if (!file) continue;

        const uploadFile: UploadFile = {
          uid: `upload-${Date.now()}-${i}`,
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'done', // 默认设置为done状态，不执行实际上传
          percent: 100,
          originFileObj: file,
          // 为所有文件设置URL或图标
          thumbUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : ''
        };

        // 执行beforeUpload钩子
        let shouldUpload = true;
        if (beforeUpload) {
          const result = await beforeUpload(file, fileArray);
          // 如果返回false，则标记为不上传，但仍然添加到文件列表
          if (result === false) {
            shouldUpload = false;
          }
        }

        // 无论beforeUpload返回什么，都添加文件到列表
        newFiles.push(uploadFile);

        // 只有在shouldUpload为true时才执行实际上传
        if (shouldUpload && customRequest) {
          // 设置为上传状态
          uploadFile.status = 'uploading';
          uploadFile.percent = 0;
        }
      }

      if (newFiles.length === 0) return;

      // 检查是否超过最大文件数
      let nextFileList = [...internalFileList, ...newFiles];
      if (maxCount !== undefined && nextFileList.length > maxCount) {
        // 保留最新的maxCount个文件
        nextFileList = nextFileList.slice(-maxCount);
      }

      // console.log('测试handleUpload fileList', fileList);
      // console.log('测试handleUpload nextFileList', nextFileList);
      // 更新内部状态
      if (!fileList) {
        setInternalFileList(nextFileList);
        internalFileListRef.current = nextFileList;
      }

      // 触发onChange回调
      if (newFiles[0]) {
        onChange?.({ file: newFiles[0], fileList: nextFileList });
      }

      // 执行上传（只对需要上传的文件）
      newFiles.forEach(file => {
        // 只有status为uploading的文件才执行上传
        if (file.status === 'uploading') {
          if (customRequest) {
            // 确保originFileObj存在
            if (file.originFileObj) {
              customRequest({
                file: file.originFileObj,
                onProgress: (percent: unknown) => {
                  updateFileStatus(file.uid, { percent: Number(percent), status: 'uploading' });
                },
                onSuccess: (response: unknown) => {
                  updateFileStatus(file.uid, { status: 'done', response });
                },
                onError: (error: unknown) => {
                  updateFileStatus(file.uid, { status: 'error', error });
                }
              });
            }
          } else {
            // 模拟上传进度
            simulateUpload(file.uid);
          }
        }
      });
    };

    // 更新文件状态
    const updateFileStatus = (uid: string, update: Partial<UploadFile>) => {
      const nextFileList = internalFileListRef.current.map(file => {
        if (file.uid === uid) {
          return { ...file, ...update };
        }
        return file;
      });

      // console.log('测试updateFileStatus fileList', fileList);
      // console.log('测试updateFileStatus nextFileList', nextFileList);
      // console.log('测试updateFileStatus internalFileList', internalFileList);
      // console.log('测试updateFileStatus internalFileListRef.current', internalFileListRef.current);

      // 只要不是受控 fileList，始终更新 internalFileList，保证 UI 持续显示
      if (!fileList) {
        setInternalFileList(nextFileList);
        internalFileListRef.current = nextFileList;
      }

      // 找到更新的文件
      const updatedFile = nextFileList.find(file => file.uid === uid);
      if (updatedFile) {
        onChange?.({ file: updatedFile, fileList: nextFileList });
      }
    };

    // 模拟上传进度
    const simulateUpload = (uid: string) => {
      let percent = 0;
      const interval = setInterval(() => {
        percent += 5; // 减小每次增加的百分比
        if (percent >= 100) {
          clearInterval(interval);
          // 添加延迟，确保100%的状态能够显示一段时间
          setTimeout(() => {
            updateFileStatus(uid, { percent: 100, status: 'done' });
          }, 800);
        } else {
          updateFileStatus(uid, { percent });
        }
      }, 500); // 增加时间间隔，使上传过程更加明显
    };

    // 处理点击上传按钮
    const handleClick = () => {
      if (disabled) return;
      inputRef.current?.click();
    };

    // 处理文件选择
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleUpload(e.target.files);
      // 重置input，确保相同文件可以重复选择
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    };

    // 处理拖拽事件
    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      setIsDragging(true);
    };

    // 处理拖拽离开事件
    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    // 处理拖拽进入事件
    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      setIsDragging(false);

      // 调用外部传入的 onDrop 处理器
      onDrop?.(e);

      const files = e.dataTransfer.files;
      handleUpload(files);
    };

    // 处理文件删除
    const handleRemove = (file: UploadFile) => {
      if (onRemove) {
        const result = onRemove(file);
        // 如果返回false或Promise<false>，则阻止删除
        if (result === false) return;
        if (result instanceof Promise) {
          result.then((shouldRemove: unknown) => {
            if (shouldRemove !== false) removeFile(file);
          });
          return;
        }
      }
      removeFile(file);
    };

    // 删除文件
    const removeFile = (file: UploadFile) => {
      const nextFileList = internalFileList.filter(item => item.uid !== file.uid);
      if (!fileList) {
        setInternalFileList(nextFileList);
        internalFileListRef.current = nextFileList;
      }
      onChange?.({ file: { ...file, status: 'removed' }, fileList: nextFileList });
    };

    // 渲染文件列表
    const renderUploadList = () => {
      // console.log('测试renderUploadList showUploadList', showUploadList);
      // console.log('测试renderUploadList internalFileList', internalFileList);

      // 解析 showUploadList 配置
      let shouldShowList = true;
      let showRemoveIcon = true;
      // 注意：showPreviewIcon 和 showDownloadIcon 暂时保留在类型定义中供未来扩展使用

      if (typeof showUploadList === 'boolean') {
        shouldShowList = showUploadList;
      } else if (showUploadList && typeof showUploadList === 'object') {
        shouldShowList = true;
        showRemoveIcon = showUploadList.showRemoveIcon !== false;
        // showPreviewIcon 和 showDownloadIcon 功能待实现
        // showPreviewIcon = showUploadList.showPreviewIcon !== false;
        // showDownloadIcon = showUploadList.showDownloadIcon !== false;
      }

      if (!shouldShowList || internalFileList.length === 0) return null;

      // 只过滤掉 status 为 removed 的文件，其他状态都显示
      const visibleFileList = internalFileList.filter(file => file.status !== 'removed');
      if (visibleFileList.length === 0) return null;

      // 根据listType渲染不同样式的列表
      if (listType === 'picture' || listType === 'picture-card') {
        return (
          <div
            className={clsx(
              'mt-2 grid gap-2',
              listType === 'picture-card' ? 'grid-cols-4' : 'grid-cols-1'
            )}
          >
            {visibleFileList.map(file => (
              <div
                key={file.uid}
                className={clsx(
                  'relative border rounded overflow-hidden',
                  listType === 'picture-card' ? 'p-1 aspect-square' : 'p-2 flex items-center'
                )}
              >
                {/* 缩略图或文件图标 - 添加点击预览功能 */}
                <div
                  className={clsx(
                    'flex items-center cursor-pointer',
                    listType === 'picture-card' ? 'justify-center h-full' : 'mr-2'
                  )}
                  onClick={e => {
                    e.stopPropagation();
                    // 处理文件预览
                    if (file.status === 'done') {
                      if (file.type.startsWith('image/') && file.thumbUrl) {
                        // 图片预览 - 创建全屏预览
                        const previewContainer = document.createElement('div');
                        previewContainer.className =
                          'fixed inset-0 bg-black/80 flex items-center justify-center z-50';
                        previewContainer.onclick = () =>
                          document.body.removeChild(previewContainer);

                        const img = document.createElement('img');
                        img.src = file.thumbUrl;
                        img.className = 'max-h-[90vh] max-w-[90vw] object-contain';
                        img.alt = file.name;

                        const closeBtn = document.createElement('button');
                        closeBtn.className = 'absolute top-4 right-4 text-white text-2xl';
                        closeBtn.innerHTML = '<span class="i-carbon-close"></span>';
                        closeBtn.onclick = e => {
                          e.stopPropagation();
                          document.body.removeChild(previewContainer);
                        };

                        previewContainer.appendChild(img);
                        previewContainer.appendChild(closeBtn);
                        document.body.appendChild(previewContainer);
                      } else if (file.url) {
                        // 如果有URL，直接在新窗口打开
                        window.open(file.url, '_blank');
                      } else if (file.originFileObj) {
                        // 为其他类型文件创建临时URL并打开
                        const fileUrl = URL.createObjectURL(file.originFileObj);
                        // window.open(fileUrl, '_blank');
                        const a = document.createElement('a');
                        a.href = fileUrl;
                        a.download = file.name;
                        a.style.display = 'none';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        // 使用后释放URL
                        setTimeout(() => URL.revokeObjectURL(fileUrl), 100);
                      }
                    }
                  }}
                >
                  {file.thumbUrl && file.type.startsWith('image/') ? (
                    <div className="relative group cursor-pointer">
                      <img
                        src={file.thumbUrl}
                        alt={file.name}
                        className={clsx(
                          listType === 'picture-card'
                            ? 'max-h-full max-w-full object-contain'
                            : 'h-10 w-10 object-cover',
                          'transition-opacity group-hover:opacity-80'
                        )}
                      />
                      {file.status === 'done' && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                          <span className="i-carbon-view text-white text-2xl bg-black/50 p-1 rounded-full w-8 h-8 flex items-center justify-center"></span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative group cursor-pointer">
                      <span
                        className={clsx(
                          listType === 'picture-card' ? 'text-3xl' : 'text-xl',
                          file.type.startsWith('image/')
                            ? 'i-carbon-image'
                            : file.type.includes('pdf')
                            ? 'i-carbon-document-pdf'
                            : file.type.includes('word') || file.type.includes('document')
                            ? 'i-carbon-document'
                            : file.type.includes('excel') || file.type.includes('sheet')
                            ? 'i-carbon-spreadsheet'
                            : file.type.includes('zip') || file.type.includes('rar')
                            ? 'i-carbon-archive'
                            : 'i-carbon-document-blank',
                          'transition-transform group-hover:scale-110 block',
                          listType === 'picture-card' ? 'w-12 h-12' : 'w-6 h-6'
                        )}
                      ></span>
                      {file.status === 'done' && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50/30">
                          <span className="i-carbon-view text-blue-500 text-lg w-6 h-6 flex items-center justify-center"></span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 文件信息 */}
                <div
                  className={
                    listType === 'picture-card'
                      ? 'absolute bottom-0 left-0 right-0 bg-black/50 text-white p-1 text-xs'
                      : 'flex-1'
                  }
                >
                  <div className="truncate">{file.name}</div>

                  {/* 上传状态 */}
                  {file.status === 'uploading' && (
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-500 mr-2">{file.percent}%</span>
                      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${file.percent}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 状态图标 */}
                <div className="absolute top-1 left-1">
                  {file.status === 'error' && (
                    <span className="i-carbon-error-filled text-red-500"></span>
                  )}
                  {file.status === 'done' && (
                    <span className="i-carbon-checkmark-filled text-green-500"></span>
                  )}
                </div>

                {/* 删除按钮 - 改进样式和位置 */}
                {!disabled && showRemoveIcon && (
                  <button
                    type="button"
                    className="absolute top-1 right-1 text-gray-500 hover:text-red-500 bg-white rounded-full p-1.5 transition-all hover:bg-red-50 z-20 shadow-sm flex items-center justify-center"
                    onClick={e => {
                      e.stopPropagation(); // 阻止冒泡，避免触发预览
                      handleRemove(file);
                    }}
                    title="删除文件"
                  >
                    <span className="i-carbon-trash-can text-lg block w-4 h-4"></span>
                  </button>
                )}
              </div>
            ))}
          </div>
        );
      }

      // 默认文本列表
      return (
        <div className="mt-2">
          {internalFileList.map(file => (
            <div
              key={file.uid}
              className="flex items-center justify-between p-2 border rounded mb-1"
            >
              <div
                className="flex items-center cursor-pointer group"
                onClick={e => {
                  e.stopPropagation();
                  // 处理文件预览
                  if (file.status === 'done') {
                    if (file.type.startsWith('image/') && file.thumbUrl) {
                      // 图片预览 - 创建全屏预览
                      const previewContainer = document.createElement('div');
                      previewContainer.className =
                        'fixed inset-0 bg-black/80 flex items-center justify-center z-50';
                      previewContainer.onclick = () => document.body.removeChild(previewContainer);

                      const img = document.createElement('img');
                      img.src = file.thumbUrl;
                      img.className = 'max-h-[90vh] max-w-[90vw] object-contain';
                      img.alt = file.name;

                      const closeBtn = document.createElement('button');
                      closeBtn.className = 'absolute top-4 right-4 text-white text-2xl';
                      closeBtn.innerHTML = '<span class="i-carbon-close"></span>';
                      closeBtn.onclick = e => {
                        e.stopPropagation();
                        document.body.removeChild(previewContainer);
                      };

                      previewContainer.appendChild(img);
                      previewContainer.appendChild(closeBtn);
                      document.body.appendChild(previewContainer);
                    } else if (file.url) {
                      // 如果有URL，直接在新窗口打开
                      window.open(file.url, '_blank');
                    } else if (file.originFileObj) {
                      // 为其他类型文件创建临时URL并打开
                      const fileUrl = URL.createObjectURL(file.originFileObj);
                      window.open(fileUrl, '_blank');
                      // 使用后释放URL
                      setTimeout(() => URL.revokeObjectURL(fileUrl), 100);
                    }
                  }
                }}
              >
                {/* 文件图标 */}
                <span
                  className={clsx(
                    'mr-2 block w-5 h-5 flex-shrink-0',
                    file.type.startsWith('image/')
                      ? 'i-carbon-image'
                      : file.type.includes('pdf')
                      ? 'i-carbon-document-pdf'
                      : file.type.includes('word') || file.type.includes('document')
                      ? 'i-carbon-document'
                      : file.type.includes('excel') || file.type.includes('sheet')
                      ? 'i-carbon-spreadsheet'
                      : file.type.includes('zip') || file.type.includes('rar')
                      ? 'i-carbon-archive'
                      : 'i-carbon-document-blank'
                  )}
                ></span>
                <span className="truncate max-w-[200px] group-hover:text-blue-500 transition-colors">
                  {file.name}
                </span>
                {file.status === 'done' && (
                  <span className="i-carbon-view ml-1 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                )}
              </div>
              <div className="flex items-center">
                {/* 上传状态 */}
                {file.status === 'uploading' && (
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-2">{file.percent}%</span>
                    <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${file.percent}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                {file.status === 'error' && (
                  <span className="i-carbon-error-filled text-red-500 mr-2"></span>
                )}
                {file.status === 'done' && (
                  <span className="i-carbon-checkmark-filled text-green-500 mr-2"></span>
                )}

                {/* 删除按钮 - 改进样式和交互 */}
                {!disabled && showRemoveIcon && (
                  <button
                    type="button"
                    className="ml-2 text-gray-500 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors z-20 flex items-center justify-center shadow-sm"
                    onClick={e => {
                      e.stopPropagation(); // 阻止冒泡，避免触发预览
                      handleRemove(file);
                    }}
                    title="删除文件"
                  >
                    <span className="i-carbon-trash-can text-lg block w-4 h-4"></span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    };

    // 渲染拖拽区域
    const renderDragArea = () => {
      // 如果提供了自定义子元素，则不显示拖拽区域
      if (children) return null;

      // 根据listType渲染不同样式的拖拽区域
      if (listType === 'picture-card') {
        return (
          <div
            ref={dropRef}
            className={clsx(
              'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <div className="flex flex-col items-center justify-center h-full">
              <span className="i-carbon-upload text-3xl mb-2 text-gray-400"></span>
              <p className="mb-1">点击或拖拽文件到此区域上传</p>
              <p className="text-xs text-gray-500">支持单个或批量上传</p>
            </div>
          </div>
        );
      }

      return (
        <div
          ref={dropRef}
          className={clsx(
            'border-2 border-dashed rounded-md p-4 transition-colors',
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="flex items-center justify-center">
            <span className="i-carbon-upload mr-2 text-gray-400"></span>
            <span>点击或拖拽文件到此区域上传</span>
          </div>
        </div>
      );
    };

    return (
      <>
        <div ref={ref} className={clsx('upload-component', className)} {...props}>
          {children ? (
            <div
              className={clsx(
                'upload-trigger cursor-pointer inline-flex',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              onClick={handleClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {children}
            </div>
          ) : (
            renderDragArea()
          )}

          <input
            ref={inputRef}
            type="file"
            name={name}
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            className="hidden"
            onChange={handleChange}
            {...(directory ? { webkitdirectory: 'true' } : {})}
          />
        </div>
        {renderUploadList()}
      </>
    );
  }
);

const Upload = UploadForwardRef as UploadComponentType;
Upload.displayName = 'Upload';
Upload.Dragger = Dragger;

export { Upload };
