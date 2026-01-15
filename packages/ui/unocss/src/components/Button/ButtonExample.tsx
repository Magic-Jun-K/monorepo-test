import React, { useState } from 'react';

import { Button } from './Button';

const handleLoad = (setLoadingFn: React.Dispatch<React.SetStateAction<boolean>>) => {
  setLoadingFn(true);
  setTimeout(() => {
    setLoadingFn(false);
  }, 3000);
};

const ButtonExample: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Button 组件示例</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">基本类型</h2>
        <div className="flex flex-wrap gap-4">
          <Button type="primary">Primary</Button>
          <Button>Default</Button>
          <Button type="dashed">Dashed</Button>
          <Button type="text">Text</Button>
          <Button type="link">Link</Button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">不同大小</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button type="primary" size="sm">
            Small
          </Button>
          <Button type="primary" size="md">
            Medium
          </Button>
          <Button type="primary" size="lg">
            Large
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">危险按钮</h2>
        <div className="flex flex-wrap gap-4">
          <Button type="primary" danger>
            Danger Primary
          </Button>
          <Button danger>Danger Default</Button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">颜色和变体</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <Button color="primary" variant="filled">
            Primary Filled
          </Button>
          <Button color="success" variant="filled">
            Success Filled
          </Button>
          <Button color="warning" variant="filled">
            Warning Filled
          </Button>
          <Button color="danger" variant="filled">
            Danger Filled
          </Button>
        </div>
        <div className="flex flex-wrap gap-4 mb-4">
          <Button color="primary" variant="outlined">
            Primary Outlined
          </Button>
          <Button color="success" variant="outlined">
            Success Outlined
          </Button>
          <Button color="warning" variant="outlined">
            Warning Outlined
          </Button>
          <Button color="danger" variant="outlined">
            Danger Outlined
          </Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button color="primary" variant="text">
            Primary Text
          </Button>
          <Button color="success" variant="text">
            Success Text
          </Button>
          <Button color="warning" variant="text">
            Warning Text
          </Button>
          <Button color="danger" variant="text">
            Danger Text
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">加载状态</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <Button type="primary" loading>
            Loading
          </Button>
          <Button loading>Loading</Button>
          <Button type="dashed" loading>
            Loading
          </Button>
          <Button type="text" loading>
            Loading
          </Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button type="primary" loading={loading} onClick={() => handleLoad(setLoading)}>
            Click to Load
          </Button>
          <Button loading={loading1} onClick={() => handleLoad(setLoading1)}>
            Default Button
          </Button>
          <Button type="dashed" loading={loading2} onClick={() => handleLoad(setLoading2)}>
            Dashed Button
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">禁用状态</h2>
        <div className="flex flex-wrap gap-4">
          <Button type="primary" disabled>
            Disabled
          </Button>
          <Button disabled>Disabled</Button>
          <Button type="dashed" disabled>
            Disabled
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">带图标</h2>
        <div className="flex flex-wrap gap-4">
          <Button icon={<span>🔍</span>}>Search</Button>
          <Button type="primary" icon={<span>+</span>}>
            Create
          </Button>
        </div>
      </div>
    </div>
  );
};
export default ButtonExample;
