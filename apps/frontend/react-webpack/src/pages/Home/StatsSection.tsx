import { FC } from 'react';
import { motion } from 'framer-motion';

const StatsSection: FC = () => {
  const stats = [
    { value: '50+', label: 'Projects Completed' },
    { value: '100%', label: 'Client Satisfaction' },
    { value: '24/7', label: 'Support' },
    { value: '15+', label: 'Technologies' },
  ];

  return (
    <section
      className="bg-linear-to-r from-white via-gray-50 to-blue-50"
      style={{ padding: '56px 0' }}
    >
      <div className="max-w-full mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl md:text-5xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 text-lg">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default StatsSection;
