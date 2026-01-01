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
  Palette
} from 'lucide-react';

import styles from './index.module.scss';

// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// AI-inspired Tech Stack Data with enhanced categories
const techStack = [
  {
    name: 'React 18',
    description: 'Modern UI framework with concurrent features',
    icon: Zap,
    category: 'frontend',
    gradientClass: 'gradientCyanBlue'
  },
  {
    name: 'TypeScript',
    description: 'Type-safe development with AI assistance',
    icon: Code,
    category: 'frontend',
    gradientClass: 'gradientBlueIndigo'
  },
  {
    name: 'Three.js',
    description: '3D web graphics and immersive experiences',
    icon: Globe,
    category: 'visualization',
    gradientClass: 'gradientGreenEmerald'
  },
  {
    name: 'Framer Motion',
    description: 'Advanced animation and gesture controls',
    icon: Sparkles,
    category: 'animation',
    gradientClass: 'gradientPurplePink'
  },
  {
    name: 'AI Integration',
    description: 'Intelligent features and automation',
    icon: Brain,
    category: 'ai',
    gradientClass: 'gradientYellowOrange'
  },
  {
    name: 'GSAP',
    description: 'Professional-grade animation platform',
    icon: MousePointer,
    category: 'animation',
    gradientClass: 'gradientGreenTeal'
  },
  {
    name: 'NestJS',
    description: 'Progressive Node.js framework',
    icon: Server,
    category: 'backend',
    gradientClass: 'gradientRedRose'
  },
  {
    name: 'PostgreSQL',
    description: 'Advanced relational database',
    icon: Database,
    category: 'database',
    gradientClass: 'gradientIndigoPurple'
  },
  {
    name: 'Docker',
    description: 'Containerization and deployment',
    icon: Package,
    category: 'devops',
    gradientClass: 'gradientCyanSky'
  },
  {
    name: 'WebGL',
    description: 'High-performance 3D graphics rendering',
    icon: CpuIcon,
    category: 'visualization',
    gradientClass: 'gradientEmeraldTeal'
  },
  {
    name: 'Tailwind CSS',
    description: 'Utility-first CSS framework',
    icon: Palette,
    category: 'frontend',
    gradientClass: 'gradientCyanBlueLight'
  },
  {
    name: 'Vite',
    description: 'Next generation frontend tooling',
    icon: Rocket,
    category: 'devtools',
    gradientClass: 'gradientPurplePinkLight'
  }
];

// Enhanced Tech Card Component with 3D effect
const TechCard: FC<{ tech: (typeof techStack)[0]; index: number }> = ({ tech, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={styles.cardContainer}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{
        scale: 1.05,
        rotateY: 5,
        z: 50
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000
      }}
    >
      <div
        className={`${styles.card} ${styles[tech.gradientClass]}`}
      >
        {/* Background pattern */}
        <div className={styles.cardBackgroundPattern}></div>

        <div className={styles.cardContent}>
          <motion.div
            className={styles.iconContainer}
            animate={{ rotate: isHovered ? 360 : 0 }}
            transition={{ duration: 0.6 }}
          >
            <tech.icon size={32} />
          </motion.div>

          <h3 className={styles.cardTitle}>{tech.name}</h3>
          <p className={styles.cardDescription}>{tech.description}</p>
        </div>

        {/* Hover effect */}
        <motion.div
          className={styles.hoverEffect}
          initial={false}
          animate={{ opacity: isHovered ? 0.1 : 0 }}
        />

        {/* Glow effect */}
        <div
          className={`${styles.glow} ${styles[tech.gradientClass]}`}
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
        ease: 'power3.out'
      }).from(
        sectionSubtitleRef.current,
        {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: 'power3.out'
        },
        '-=0.5'
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
          stagger: 0.1
        });
      }
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section
      ref={techStackRef}
      className={styles.section}
    >
      {/* 背景图案 */}
      <div className={styles.backgroundPattern}></div>

      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className={styles.header}
        >
          <h2
            ref={sectionTitleRef}
            className={styles.title}
          >
            AI-Powered Tech Stack
          </h2>
          <p
            ref={sectionSubtitleRef}
            className={styles.subtitle}
          >
            Leveraging cutting-edge technologies enhanced with artificial intelligence to create
            next-generation digital experiences
          </p>
        </motion.div>

        <div
          ref={techGridRef}
          className={styles.grid}
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