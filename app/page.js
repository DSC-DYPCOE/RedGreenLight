"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import squidgamesAnimation from "../public/squidgames.json";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Circle, Square, Triangle } from "lucide-react";

const LottieComponent = dynamic(() => import("lottie-react").then((mod) => mod.default), {
  ssr: false,
  loading: () => <div className="w-[800px] h-[800px] bg-gray-800 animate-pulse rounded-lg"></div>,
});

const Home = () => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowButton(scrollPosition > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 1,
        when: "beforeChildren",
      }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.5 }
    }
  };

  const lottieVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100
      }
    }
  };

  const buttonVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100
      }
    },
    hover: {
      scale: 1.05,
      boxShadow: "0px 0px 20px rgba(226, 183, 20, 0.4)",
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 200
      }
    },
    tap: {
      scale: 0.95
    }
  };

  return (
    <motion.div 
      className="min-h-[150vh] bg-[#323437]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Centered Lottie Animation */}
      <motion.div 
        className="h-screen flex items-center justify-center"
        variants={lottieVariants}
      >
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.div 
            className="absolute inset-0 bg-[#f763a5] blur-3xl opacity-10"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <div className="w-[800px] h-[800px] flex items-center justify-center relative">
            <LottieComponent
              animationData={squidgamesAnimation}
              className="w-full h-full"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll Section with Button */}
      <div className="min-h-screen flex items-center justify-center relative">
        <AnimatePresence>
          {showButton && (
            <motion.div
              className="text-center space-y-4"
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <Link href="/slot">
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="bg-[#e2b714] text-[#323437] font-mono text-2xl px-16 py-6 rounded-lg shadow-lg relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-[#c49c11] opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.3 }}
                  />
                  <motion.span className="relative z-10 flex items-center gap-2">
                    <Circle size={24} />
                    <Triangle size={24} />
                    <Square size={24} />

                  </motion.span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
                    animate={{
                      x: [-500, 500],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                  />
                </motion.button>
              </Link>

              <Link href="/prize">
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="ml-12 bg-[#af4c4c] text-white font-mono text-2xl px-16 py-6 rounded-lg shadow-lg relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-[#f72585] opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.3 }}
                  />
                  <motion.span className="relative z-10">
                    view prizes
                  </motion.span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f72585] to-transparent opacity-0 group-hover:opacity-20"
                    animate={{
                      x: [-500, 500],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                  />
                </motion.button>
              </Link>

              <motion.p 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: 0.3 }
                  }
                }}
                className="mt-6 text-[#646669] font-mono text-lg"
              >
                456 players remaining
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Home;
