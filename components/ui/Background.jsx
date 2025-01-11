import React from 'react';
import { motion } from 'framer-motion';

const Background = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-slate-950">
      {/* Main Geometric Shapes */}
      <div className="absolute inset-0">
        {/* Circle */}
        <motion.div
          className="absolute top-[15%] right-[20%] w-40 h-40 border-4 rounded-full border-pink-500"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Triangle */}
        <motion.div
          className="absolute bottom-[20%] left-[15%] w-40 h-40"
          animate={{
            rotate: [0, 360],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div
            className="w-full h-full border-4 border-green-400"
            style={{
              clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
            }}
          />
        </motion.div>

        {/* Square */}
        <motion.div
          className="absolute top-[25%] left-[25%] w-40 h-40 border-4 border-pink-500"
          animate={{
            rotate: [45, 225, 45],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Subtle Glow Effects */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`glow-${i}`}
          className="absolute rounded-full blur-3xl"
          style={{
            width: '400px',
            height: '400px',
            left: `${(i * 30) + 20}%`,
            top: `${30 + (i * 20)}%`,
            background: i % 2 === 0
              ? 'radial-gradient(circle, rgba(255,15,123,0.08) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(69,209,102,0.08) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: i * 2,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Minimal Grid Overlay */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%">
          <pattern id="grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    </div>
  );
};

export default Background;