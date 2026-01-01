import { FC, useEffect } from 'react';
import { Code, GitBranch, Rocket, Sparkles } from 'lucide-react';

import HeroSection from './HeroSection/HeroSection';
import StatsSection from './StatsSection/StatsSection';
import TechStackSection from './TechStackSection/TechStackSection';

import { loadScript } from '@/utils/loadScript';

import styles from './index.module.scss';

// 重构后的Main Home Component
const Home: FC = () => {
  useEffect(() => {
    loadScript({
      // src: 'https://cdn.jsdelivr.net/npm/three@0.181.2/build/three.module.min.js',
      // integrity: 'sha256-l5wa5LBXnJkB6s95dgLAtG3xKdhxAsZEPRS+Sh95C3A=',
      // crossorigin: 'anonymous',
      src: 'https://cdn.jsdelivr.net/npm/three@0.182.0/+esm',
      type: 'module',
    });
  }, []);

  return (
    <div className={styles.Home}>
      {/* 英雄部分 */}
      <HeroSection />

      {/* 统计部分 */}
      <StatsSection />

      {/* 功能部分 */}
      {/* <FeaturesSection /> */}

      {/* 技术栈部分 */}
      <TechStackSection />

      {/* 增强的页脚 */}
      <footer className="bg-gray-50 border-t border-gray-200" style={{ padding: '4rem 0' }}>
        <div className="max-w-full mx-auto px-6">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <Sparkles size={40} className="text-blue-600" />
            </div>

            <p className="text-gray-600 mb-8 text-lg">
              © 2025 Crafted with AI, React, Three.js & Passion
            </p>

            <div className="flex justify-center space-x-8">
              {[
                { icon: Code, label: 'Code', href: '#' },
                { icon: GitBranch, label: 'Git', href: '#' },
                { icon: Rocket, label: 'Deploy', href: '#' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-gray-500 hover:text-blue-600 transition-colors duration-300"
                >
                  <item.icon size={24} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default Home;
