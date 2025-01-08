'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Keyboard, Play, Trophy, Users, Book, AlertCircle, Type } from 'lucide-react';
import Background from "../components/ui/Background";
const Home = () => {
  const [isHoveringDemo, setIsHoveringDemo] = useState(false);
  const [demoLight, setDemoLight] = useState('green');
  const [demoText, setDemoText] = useState('');
  const [showDoll, setShowDoll] = useState(false);
  const sampleText = "Type Here...";

  useEffect(() => {
    if (isHoveringDemo) {
      const interval = setInterval(() => {
        setDemoLight(prev => {
          setShowDoll(prev === 'green');
          return prev === 'green' ? 'red' : 'green';
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isHoveringDemo]);

  const handleDemoType = (e) => {
    if (demoLight === 'green') {
      setDemoText(e.target.value);
    }
  };

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const dollVariants = {
    initial: { rotateY: 0 },
    turned: { 
      rotateY: 180,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen relative bg-black text-white overflow-hidden"
    >
      {/* Enhanced Background Elements */}
      <Background />

      {/* Main Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-16">
          {/* Animated Header */}
          <motion.div
            variants={itemVariants}
            className="text-center mb-12"
          >
            <motion.h1 
              className="text-7xl font-bold mb-6 relative"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.span
                animate={{ 
                  color: ['#22c55e', '#ef4444', '#22c55e'],
                  rotateY: [0, 360]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="inline-block"
              >
                Type
              </motion.span>
              <span className="mx-4">or</span>
              <motion.span
                animate={{ 
                  scale: [1, 1.1, 1],
                  color: ['#ef4444', '#dc2626', '#ef4444']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Die
              </motion.span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-2xl text-gray-300 mb-8"
            >
              Welcome to the ultimate high-stakes typing challenge
            </motion.p>

            <motion.div 
              className="flex justify-center gap-4"
              variants={itemVariants}
            >
              <motion.button
                whileHover={{ scale: 1.05, rotate: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-lg font-bold text-xl 
                         flex items-center gap-2 shadow-lg shadow-pink-500/20"
              >
                <Play className="w-6 h-6" />
                DEMO
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg font-bold text-xl 
                         flex items-center gap-2"
              >
                <Book className="w-6 h-6" />
                Start
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Interactive Demo Section */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="max-w-3xl mx-auto bg-gray-800/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl mb-16 border border-pink-500/20"
            onMouseEnter={() => setIsHoveringDemo(true)}
            onMouseLeave={() => {
              setIsHoveringDemo(false);
              setDemoLight('green');
              setShowDoll(false);
            }}
          >
            <motion.div
              animate={demoLight === 'green' ? 
                { scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] } : 
                { scale: 1 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex items-center justify-center mb-6"
            >
              {/* Guardian Icon */}
              <motion.div
                variants={dollVariants}
                animate={showDoll ? "turned" : "initial"}
                className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
                style={{
                  background: demoLight === 'green' ? '#22c55e' : '#ef4444',
                }}
              >
                {showDoll ? (
                  <span className="text-4xl">🎎</span>
                ) : (
                  <Type className="w-12 h-12" />
                )}
              </motion.div>
            </motion.div>

            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              value={demoText}
              onChange={handleDemoType}
              placeholder={sampleText}
              className={`w-full bg-gray-700/80 p-4 rounded-lg text-center text-lg transition-all
                       ${demoLight === 'red' ? 'cursor-not-allowed opacity-50' : ''}`}
              disabled={demoLight === 'red'}
            />
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Keyboard,
                title: "Elite Games",
                description: "Join with players in the ultimate typing challenge"
              },
              {
                icon: Trophy,
                title: "Fortune Awaits",
                description: "One winner takes home the life-changing prize"
              },
              {
                icon: AlertCircle,
                title: "Red Light...",
                description: "Follow the guardian's commands precisely"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  rotate: -1,
                  transition: { type: "spring", stiffness: 300 }
                }}
                className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg text-center border border-pink-500/20"
              >
                <motion.div
                  animate={{ 
                    y: [0, -5, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <feature.icon className="w-12 h-12 mx-auto mb-4 text-pink-500" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Stats Bar */}
        <motion.div
          variants={itemVariants}
          className="bg-gray-800/50 backdrop-blur-sm py-8 border-t border-pink-500/20"
        >
          <div className="container mx-auto px-4">
            <div className="flex justify-around items-center text-center">
              {[
                { value: "456", label: "Players Remaining" },
                { value: "Rs?", label: "Grand Prize" },
                { value: "001", label: "Next Player" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  className="group"
                >
                  <motion.div
                    animate={{ 
                      y: [0, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    className="text-3xl font-bold text-pink-500"
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-gray-300">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;