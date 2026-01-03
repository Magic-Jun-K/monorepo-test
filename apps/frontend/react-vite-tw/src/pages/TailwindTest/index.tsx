import { FC } from 'react';

// Tailwind CSS 4.x 测试组件
const TailwindTest: FC = () => {
  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 标题部分 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800">Tailwind CSS 4.x 测试</h1>
        </div>

        {/* 卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* 卡片1 */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-blue-500 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-white text-xl font-bold">🎨</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">现代化设计</h3>
            <p className="text-gray-600">使用最新的设计系统和颜色方案</p>
          </div>

          {/* 卡片2 */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-green-500 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-white text-xl font-bold">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">高性能</h3>
            <p className="text-gray-600">优化的CSS生成，只包含使用的样式</p>
          </div>

          {/* 卡片3 */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-purple-500 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-white text-xl font-bold">📱</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">响应式</h3>
            <p className="text-gray-600">移动端优先的响应式设计</p>
          </div>
        </div>

        {/* 按钮组 */}
        <div className="text-center space-x-4 mb-12">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg">
            开始使用
          </button>
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors duration-200">
            了解更多
          </button>
        </div>

        {/* 动画效果展示 */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">动画效果</h3>
          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full animate-bounce mb-4 mx-auto"></div>
              <p className="text-sm text-gray-600">弹跳动画</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full animate-pulse mb-4 mx-auto"></div>
              <p className="text-sm text-gray-600">脉冲动画</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full animate-spin mb-4 mx-auto"></div>
              <p className="text-sm text-gray-600">旋转动画</p>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed top-18 right-4 z-50">
        <div className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-blue-600">
          <h3 className="text-lg font-bold mb-1">Tailwind CSS 4.x</h3>
          <p className="text-sm opacity-90">✨ 已成功集成！</p>
          <div className="mt-2 flex space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse delay-100"></div>
            <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse delay-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TailwindTest;