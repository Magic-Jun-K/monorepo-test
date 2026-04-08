import { FC, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Code,
  Database,
  Server,
  Globe,
  Zap,
  Package,
  Rocket,
  Sparkles,
  MousePointer,
  Brain,
  CpuIcon,
  Palette,
} from 'lucide-react';

// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// AI-inspired Tech Stack Data with enhanced categories
const techStack = [
  {
    name: 'React 18',
    description: 'Modern UI framework with concurrent features',
    icon: Zap,
    category: 'frontend',
    color: 'from-cyan-400 to-blue-600',
  },
  {
    name: 'TypeScript',
    description: 'Type-safe development with AI assistance',
    icon: Code,
    category: 'frontend',
    color: 'from-blue-400 to-indigo-600',
  },
  {
    name: 'Three.js',
    description: '3D web graphics and immersive experiences',
    icon: Globe,
    category: 'visualization',
    color: 'from-green-400 to-emerald-600',
  },
  {
    name: 'Framer Motion',
    description: 'Advanced animation and gesture controls',
    icon: Sparkles,
    category: 'animation',
    color: 'from-purple-400 to-pink-600',
  },
  {
    name: 'AI Integration',
    description: 'Intelligent features and automation',
    icon: Brain,
    category: 'ai',
    color: 'from-yellow-400 to-orange-600',
  },
  {
    name: 'GSAP',
    description: 'Professional-grade animation platform',
    icon: MousePointer,
    category: 'animation',
    color: 'from-green-400 to-teal-600',
  },
  {
    name: 'NestJS',
    description: 'Progressive Node.js framework',
    icon: Server,
    category: 'backend',
    color: 'from-red-400 to-rose-600',
  },
  {
    name: 'PostgreSQL',
    description: 'Advanced relational database',
    icon: Database,
    category: 'database',
    color: 'from-indigo-400 to-purple-600',
  },
  {
    name: 'Docker',
    description: 'Containerization and deployment',
    icon: Package,
    category: 'devops',
    color: 'from-cyan-400 to-sky-600',
  },
  {
    name: 'WebGL',
    description: 'High-performance 3D graphics rendering',
    icon: CpuIcon,
    category: 'visualization',
    color: 'from-emerald-400 to-teal-600',
  },
  {
    name: 'Tailwind CSS',
    description: 'Utility-first CSS framework',
    icon: Palette,
    category: 'frontend',
    color: 'from-cyan-400 to-blue-500',
  },
  {
    name: 'Vite',
    description: 'Next generation frontend tooling',
    icon: Rocket,
    category: 'devtools',
    color: 'from-purple-400 to-pink-500',
  },
];

// Enhanced Tech Card Component with 3D effect
const TechCard: FC<{ tech: (typeof techStack)[0]; index: number }> = ({ tech, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{
        scale: 1.05,
        rotateY: 5,
        z: 50,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
    >
      <div
        className={`relative bg-linear-to-br ${tech.color} p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden transform-gpu`}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-linear-to-br from-white to-transparent"></div>
        </div>

        <div className="relative z-10 text-center">
          <motion.div
            className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-white bg-opacity-20 backdrop-blur-sm rounded-xl"
            animate={{ rotate: isHovered ? 360 : 0 }}
            transition={{ duration: 0.6 }}
          >
            <tech.icon size={32} className="text-white" />
          </motion.div>

          <h3 className="font-bold text-white text-lg mb-2">{tech.name}</h3>
          <p className="text-white text-opacity-90 text-sm leading-relaxed">{tech.description}</p>
        </div>

        {/* Hover effect */}
        <motion.div
          className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"
          initial={false}
          animate={{ opacity: isHovered ? 0.1 : 0 }}
        />

        {/* Glow effect */}
        <div
          className={`absolute -inset-1 bg-linear-to-r ${tech.color} rounded-2xl opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-500 -z-10`}
        ></div>
      </div>
    </motion.div>
  );
};

const TechStackSection: FC = () => {
  const techStackRef = useRef<HTMLDivElement>(null);
  const sectionTitleRef = useRef<HTMLHeadingElement>(null);
  const sectionSubtitleRef = useRef<HTMLParagraphElement>(null);
  const techGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 增强的动画效果
    if (sectionTitleRef.current && sectionSubtitleRef.current) {
      const tl = gsap.timeline();

      tl.from(sectionTitleRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out',
      }).from(
        sectionSubtitleRef.current,
        {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: 'power3.out',
        },
        '-=0.5',
      );
    }

    // 技术栈渐进动画
    if (techGridRef.current) {
      const techCards = techGridRef.current.children;
      if (techCards.length > 0) {
        gsap.from(techCards, {
          opacity: 0,
          y: 30,
          duration: 0.6,
          stagger: 0.1,
        });
      }
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section
      ref={techStackRef}
      className="tech-stack-section px-6 bg-linear-to-br from-gray-50 via-white to-blue-50 relative"
      style={{ paddingTop: '72px', paddingBottom: '72px' }}
    >
      {/* 背景图案 */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)`,
          }}
        />
      </div>

      <div className="max-w-full mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2
            ref={sectionTitleRef}
            className="section-title text-5xl md:text-6xl font-bold bg-linear-to-r from-gray-900 to-gray-800 bg-clip-text text-transparent mb-6"
          >
            AI-Powered Tech Stack
          </h2>
          <p
            ref={sectionSubtitleRef}
            className="section-subtitle text-xl text-gray-600 max-w-full mx-auto leading-relaxed"
          >
            Leveraging cutting-edge technologies enhanced with artificial intelligence to create
            next-generation digital experiences
          </p>
        </motion.div>

        <div
          ref={techGridRef}
          className="tech-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {techStack.map((tech, index) => (
            <TechCard key={tech.name} tech={tech} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
export default TechStackSection;
