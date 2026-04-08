import { FC, useEffect, useRef } from 'react';
// import { Canvas } from '@react-three/fiber';
import * as Three from 'three';
import { motion } from 'framer-motion';

// Hero Section Component
// 实现类似Dora官网的3D效果
const HeroSection: FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!heroRef.current || !canvasRef.current) return;

    // 创建3D场景
    const scene = new Three.Scene();
    const camera = new Three.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    const renderer = new Three.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff);

    // 添加灯光
    const ambientLight = new Three.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new Three.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // 创建3D元素
    const create3DElement = (
      geometry: Three.BufferGeometry,
      material: Three.Material,
      position: [number, number, number],
      rotation: [number, number, number],
    ) => {
      const mesh = new Three.Mesh(geometry, material);
      mesh.position.set(...position);
      mesh.rotation.set(...rotation);
      scene.add(mesh);
      return mesh;
    };

    // 创建前端技术图标（React）
    const reactGeometry = new Three.BoxGeometry(1, 1, 1);
    const reactMaterial = new Three.MeshPhongMaterial({
      color: 0x61dafb,
      emissive: 0x1b4d8c,
      shininess: 100,
    });
    const react = create3DElement(reactGeometry, reactMaterial, [-2, 0, 0], [0, 0, 0]);

    // 创建后端技术图标（Node.js）
    const nodeGeometry = new Three.CylinderGeometry(0.5, 0.5, 1, 8);
    const nodeMaterial = new Three.MeshPhongMaterial({
      color: 0x8bc53f,
      emissive: 0x5a8c2b,
      shininess: 100,
    });
    const node = create3DElement(nodeGeometry, nodeMaterial, [2, 0, 0], [0, 0, 0]);

    // 创建数据库图标（PostgreSQL）
    const dbGeometry = new Three.SphereGeometry(0.8, 32, 32);
    const dbMaterial = new Three.MeshPhongMaterial({
      color: 0x0000ff,
      emissive: 0x00008b,
      shininess: 100,
    });
    const db = create3DElement(dbGeometry, dbMaterial, [0, 2, 0], [0, 0, 0]);

    // 创建AI图标
    const aiGeometry = new Three.TorusGeometry(0.5, 0.2, 16, 32);
    const aiMaterial = new Three.MeshPhongMaterial({
      color: 0xff6b6b,
      emissive: 0x9e3c3c,
      shininess: 100,
    });
    const ai = create3DElement(aiGeometry, aiMaterial, [0, -2, 0], [0, 0, 0]);

    // 创建云服务图标
    const cloudGeometry = new Three.SphereGeometry(0.6, 32, 32);
    const cloudMaterial = new Three.MeshPhongMaterial({
      color: 0x4ecdc4,
      emissive: 0x2a8b8b,
      shininess: 100,
    });
    const cloud = create3DElement(cloudGeometry, cloudMaterial, [0, 0, 2], [0, 0, 0]);

    // 设置相机位置
    camera.position.z = 5;

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);

      // 所有元素都围绕中心旋转
      react.rotation.y += 0.01;
      node.rotation.y += 0.01;
      db.rotation.y += 0.01;
      ai.rotation.y += 0.01;
      cloud.rotation.y += 0.01;

      // 元素位置随时间变化
      react.position.x = -2 + Math.sin(Date.now() * 0.001) * 0.5;
      node.position.x = 2 + Math.cos(Date.now() * 0.001) * 0.5;
      db.position.y = 2 + Math.sin(Date.now() * 0.001) * 0.3;
      ai.position.y = -2 + Math.cos(Date.now() * 0.001) * 0.3;
      cloud.position.z = 2 + Math.sin(Date.now() * 0.001) * 0.5;

      renderer.render(scene, camera);
    };
    animate();

    // 滚动监听器 - 实现立体旋转效果
    const handleScroll = () => {
      if (!heroRef.current) return;

      const rect = heroRef.current.getBoundingClientRect();
      const scrollPosition = window.pageYOffset;
      const elementTop = rect.top;
      const elementBottom = rect.bottom;

      // 当元素在视口中时，根据滚动位置调整旋转
      if (elementTop <= window.innerHeight && elementBottom >= 0) {
        const scrollPercent = (scrollPosition - elementTop) / (elementBottom - elementTop);
        const rotationX = scrollPercent * 30;
        const rotationY = scrollPercent * 20;

        // 应用旋转到3D场景
        camera.position.x = rotationY * 0.1;
        camera.position.y = rotationX * 0.1;
        camera.lookAt(0, 0, 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      renderer.dispose();
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="hero-section relative h-screen flex items-center justify-center overflow-hidden bg-linear-to-br from-gray-50 via-white to-blue-50"
    >
      {/* 3D Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }} />

      {/* 内容层 */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h1 className="text-3xl md:text-6xl font-bold bg-linear-to-r from-gray-900 to-gray-800 bg-clip-text text-transparent mb-6">
            Full-Stack
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Start with AI
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
export default HeroSection;
