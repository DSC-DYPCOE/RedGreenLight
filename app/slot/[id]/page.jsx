"use client";

import { useState, useEffect, use, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import Cookies from "js-cookie";
import { Howl } from "howler";
import Link from "next/link";

export default function TypingTest({ params }) {
  const [slotText, setSlotText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [isGreen, setIsGreen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTimeReached, setStartTimeReached] = useState(false);
  const [finish, setFinish] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [prevInputLength, setPrevInputLength] = useState(0);
  const [scoredPositions, setScoredPositions] = useState(new Set());
  const [socket, setSocket] = useState(null);
  const [slot, setSlot] = useState({ leaderboard: [] });
  const [username, setUsername] = useState("");
  const [sounds, setSounds] = useState({
    greenSound: null,
    redSound: null,
    shotSound: null,
    mainLoop: null
  });
  const { id } = use(params);
  const textDisplayRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Add username effect
  useEffect(() => {
    const storedUsername = Cookies.get("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  // Add leaderboard update socket listener
  useEffect(() => {
    if (socket) {
      socket.on("leaderboard-update", (data) => {
        if (data.slotId === id) {
          setSlot(prevSlot => ({
            ...prevSlot,
            leaderboard: data.leaderboard
          }));
        }
      });

      return () => {
        socket.off("leaderboard-update");
      };
    }
  }, [socket, id]);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL);
    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  // Initialize audio files
  useEffect(() => {
    const greenSound = new Howl({ src: ["/green.mp3"] });
    const redSound = new Howl({ src: ["/red.mp3"] });
    const shotSound = new Howl({ src: ["/shot.mp3"] });
    const mainLoop = new Howl({
      src: ["/main.m4a"],
      loop: true,
    });

    setSounds({
      greenSound,
      redSound,
      shotSound,
      mainLoop
    });

    return () => {
      // Clean up sounds on unmount
      greenSound.unload();
      redSound.unload();
      shotSound.unload();
      mainLoop.unload();
    };
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (finish || timeRemaining <= 0) return; // Only check for game end, not isDisabled
      
      // Handle input regardless of light color
      if (e.key === "Backspace") {
        setUserInput(prev => prev.slice(0, -1));
      } else if (e.key.length === 1) {
        setUserInput(prev => prev + e.key);
      }
    };

    if (isFocused) {
      window.addEventListener("keydown", handleKeyPress);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [finish, timeRemaining, isFocused]);

  // Separate timer effect
  useEffect(() => {
    let timerInterval;
    
    if (startTimeReached && timeRemaining > 0) {
      timerInterval = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            clearInterval(timerInterval);
            setIsDisabled(true);
            setFinish(true);
            
            // Stop all sounds when timer ends
            if (sounds.mainLoop?.playing()) sounds.mainLoop.stop();
            if (sounds.greenSound?.playing()) sounds.greenSound.stop();
            if (sounds.redSound?.playing()) sounds.redSound.stop();

            // Update final score when time is over
            const username = Cookies.get("username");
            if (username) {
              const payload = {
                username,
                slotId: id,
                score: score
              };
              axios.patch("/api/admin/slot", payload)
                .then(() => {
                  console.log("Final score updated successfully");
                  if (socket) {
                    socket.emit("score-update", {
                      slotId: id,
                      username,
                      score: score
                    });
                  }
                })
                .catch(error => {
                  console.error("Error updating final score:", error);
                });
            }
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [startTimeReached, id, socket, sounds]);

  // Modify the fetchSlotData effect to only set initial time
  useEffect(() => {
    const fetchSlotData = async () => {
      try {
        const response = await axios.get(`/api/slots/${id}`);
        const { startTime, endTime, leaderboard } = response.data;

        setSlot(prevSlot => ({
          ...prevSlot,
          leaderboard: leaderboard || []
        }));

        const currentDate = new Date();
        const [startHour, startMinute] = startTime.split(":").map(Number);
        const [endHour, endMinute] = endTime.split(":").map(Number);

        const startDate = new Date(currentDate);
        startDate.setHours(startHour, startMinute, 0, 0);

        const endDate = new Date(currentDate);
        endDate.setHours(endHour, endMinute, 0, 0);

        if (endDate < startDate) {
          endDate.setDate(endDate.getDate() + 1);
        }

        const currentTime = new Date();
        const timeUntilStart = (startDate - currentTime) / 1000;
        const timeLeft = Math.max((endDate - currentTime) / 1000, 0);

        setTimeRemaining(timeLeft);

        if (timeUntilStart <= 0) {
          setStartTimeReached(true);
          setIsDisabled(false);
        } else {
          setTimeout(() => {
            setStartTimeReached(true);
            setIsDisabled(false);
          }, timeUntilStart * 1000);
        }
      } catch (error) {
        console.error("Detailed fetch error:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        // Handle error appropriately in the UI
      }
    };

    fetchSlotData();
  }, [id]);

  // Add useEffect to load saved score from cookie when component mounts
  useEffect(() => {
    const savedScore = Cookies.get(`score_${id}`);
    if (savedScore) {
      setScore(parseInt(savedScore));
      // Update leaderboard with saved score
      updateLeaderboard(parseInt(savedScore));
    }
  }, [id]);

  // Modify the score update logic to save to cookie
  useEffect(() => {
    if (slotText) {
      const lastInputChar = userInput[userInput.length - 1];
      const lastCharIndex = userInput.length - 1;
      
      if (lastInputChar && 
          userInput.length > 0 && 
          userInput.length > prevInputLength && 
          !scoredPositions.has(lastCharIndex) &&
          lastCharIndex >= scoredPositions.size) {
        
        if (!isGreen) {
          setScore(prev => {
            const newScore = prev - 5;
            updateLeaderboard(newScore);
            Cookies.set(`score_${id}`, newScore.toString());
            return newScore;
          });
          sounds.shotSound.play();
        } else {
          const correctChar = slotText[lastCharIndex];
          if (lastInputChar === correctChar) {
            setScore(prev => {
              const newScore = prev + 3;
              updateLeaderboard(newScore);
              Cookies.set(`score_${id}`, newScore.toString());
              return newScore;
            });
          } else {
            setScore(prev => {
              const newScore = prev - 1;
              updateLeaderboard(newScore);
              Cookies.set(`score_${id}`, newScore.toString());
              return newScore;
            });
          }
        }
        
        setScoredPositions(prev => new Set([...prev, lastCharIndex]));
      }
      
      setPrevInputLength(userInput.length);
    }
  }, [userInput, slotText, isGreen]);

  // Add cleanup for cookies when the game ends
  useEffect(() => {
    if (finish || timeRemaining <= 0) {
      // Keep the final score in cookie for 24 hours
      Cookies.set(`score_${id}`, score.toString(), { expires: 1 });
      
      // Stop all sounds when game ends
      if (sounds.mainLoop && sounds.mainLoop.playing()) {
        sounds.mainLoop.stop();
      }
      if (sounds.greenSound && sounds.greenSound.playing()) {
        sounds.greenSound.stop();
      }
      if (sounds.redSound && sounds.redSound.playing()) {
        sounds.redSound.stop();
      }
    }
  }, [finish, timeRemaining, score, id, sounds]);

  // Add this function to handle immediate leaderboard updates
  const updateLeaderboard = async (newScore) => {
    const username = Cookies.get("username");
    if (!username) {
      console.error("Username not found in cookies.");
      return;
    }
    try {
      const payload = {
        username,
        slotId: id,
        score: newScore,
      };
      await axios.patch("/api/admin/slot", payload);
      // Emit score update through socket
      if (socket) {
        socket.emit("score-update", {
          slotId: id,
          username,
          score: newScore
        });
      }
      console.log("Leaderboard updated successfully with score:", newScore);
    } catch (error) {
      console.error("Error updating leaderboard:", error);
    }
  };

  const remainingTime = () => {
    if (timeRemaining <= 0) {
      return "Test has ended.";
    }
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = Math.round(timeRemaining % 60);
    return `Time remaining: ${minutes}m ${seconds}s`;
  };

  useEffect(() => {
    if (startTimeReached && timeRemaining > 0 && socket) {
      socket.emit("request-light-state", { slotId: id });

      socket.on("light-state", (data) => {
        if (data.slotId === id) {
          setSlotText(data.paragraph);
          handleLightToggle(data.isGreen);
        }
      });

      socket.on("light-toggle", (data) => {
        if (data.slotId === id) {
          handleLightToggle(data.isGreen);
        }
      });

      return () => {
        socket.off("light-state");
        socket.off("light-toggle");
      };
    }
  }, [id, startTimeReached, timeRemaining, socket]);

  const handleLightToggle = (isGreenState) => {
    setIsGreen(isGreenState);
  
    if (isGreenState && timeRemaining > 0 && !finish) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  };

  useEffect(() => {
    if(isGreen && sounds.greenSound && sounds.mainLoop){
      if (!sounds.greenSound.playing()) {
        sounds.greenSound.play();
      }
      if (!sounds.mainLoop.playing()) {
        sounds.mainLoop.play();
      }
    }
    else if (!isGreen && sounds.redSound && sounds.mainLoop){
      if (!sounds.redSound.playing()) {
        sounds.redSound.play();
      }
      if (sounds.mainLoop.playing()) {
        sounds.mainLoop.stop();
      }
    }
  }, [isGreen, sounds]);

  // Improve the scroll effect
  useEffect(() => {
    if (userInput && userInput.length > 0 && textDisplayRef.current) {
      const container = textDisplayRef.current;
      const cursorElement = container.querySelector('[data-cursor="true"]');
      
      if (cursorElement) {
        const containerRect = container.getBoundingClientRect();
        const cursorRect = cursorElement.getBoundingClientRect();
        
        // Check if cursor is near bottom of visible area
        const cursorBottom = cursorRect.top - containerRect.top;
        const visibleHeight = container.clientHeight;
        
        if (cursorBottom > visibleHeight * 0.8) { // Scroll when cursor is in bottom 20%
          container.scrollTo({
            top: container.scrollTop + (cursorRect.height * 2),
            behavior: 'smooth'
          });
        }
      }
    }
  }, [userInput]);

  return (
    <div className={`min-h-screen bg-[#16161a] text-[#646669] flex flex-col relative isolate overflow-hidden ${
      isGreen && !finish && timeRemaining > 0 
        ? 'after:fixed after:inset-0 after:bg-[#4CAF50]/5 after:pointer-events-none after:border-[#4CAF50]/60 after:border-4 after:animate-glow before:fixed before:inset-0 before:bg-gradient-to-b before:from-[#4CAF50]/20 before:to-transparent before:pointer-events-none' 
        : !isGreen && !finish && timeRemaining > 0
        ? 'after:fixed after:inset-0 after:bg-[#f44336]/5 after:pointer-events-none after:border-[#f44336]/60 after:border-4 after:animate-glow before:fixed before:inset-0 before:bg-gradient-to-b before:from-[#f44336]/20 before:to-transparent before:pointer-events-none'
        : ''
    }`}>
      {/* Top Navigation */}
      <nav className="sticky top-0 w-full p-4 flex items-center justify-between bg-black/20 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-[#d1d0c5] font-bold text-xl">
            TypeToSurvive
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <button className="px-3 py-1 rounded bg-[#2c2e31] text-[#646669]">@ punctuation</button>
            <button className="px-3 py-1 rounded bg-[#2c2e31] text-[#646669]"># numbers</button>
            <button className="px-3 py-1 rounded bg-[#2c2e31] text-[#e2b714]">time {Math.max(0, Math.round(timeRemaining))}s</button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#646669]">english</span>
        </div>
      </nav>

      {/* Main Content */}
      <main 
        className={`flex-1 flex flex-col items-center justify-center px-4 -mt-20 ${
          (finish || timeRemaining <= 0 || isDisabled) ? 'cursor-not-allowed' : ''
        }`}
        tabIndex={0}
        onFocus={() => !finish && timeRemaining > 0 && setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        {/* Text Display */}
        <div className="max-w-[1200px] w-full mb-8 text-center relative">
          {(!isFocused && timeRemaining > 0 && !finish) && (
            <div className="absolute inset-0 flex items-center justify-center text-[#646669] text-lg">
              Click here or press any key to focus
            </div>
          )}
          {(finish || timeRemaining <= 0) && (
            <div className="absolute inset-0 flex items-center justify-center text-[#ca4754] text-lg">
              Test has ended. Your final score: {score}
            </div>
          )}
          <div 
            ref={textDisplayRef}
            className={`text-3xl font-mono h-60 overflow-hidden overflow-y-auto tracking-wide leading-relaxed flex flex-wrap justify-center ${
              (isFocused && !finish && timeRemaining > 0) ? '' : 'opacity-50'
            } scroll-smooth px-4`}
            style={{
              scrollBehavior: 'smooth',
              paddingTop: '1rem',
              paddingBottom: '1rem',
              letterSpacing: '0.05em',
              wordSpacing: '1em'
            }}
          >
            {slotText.split('').map((char, i) => (
              <span 
                key={i}
                data-cursor={i === userInput.length}
                className={`${
                  i < userInput.length 
                    ? userInput[i] === char
                      ? 'text-[#d1d0c5]' 
                      : 'text-[#ca4754]'
                    : 'text-[#646669]'
                } ${i === userInput.length ? 'relative' : ''} ${char === ' ' ? 'mx-2' : ''}`}
              >
                {char}
                {i === userInput.length && isFocused && (
                  <span 
                    className={`absolute left-0 w-[2px] h-[80%] top-[10%] ${
                      isGreen ? 'bg-[#4CAF50]' : 'bg-[#f44336]'
                    } animate-blink`}
                  />
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex gap-8 text-xl font-mono mt-8">
          <div>
            <span className="text-[#646669]">score: </span>
            <span className="text-[#d1d0c5]">{score}</span>
          </div>
          <div>
            <span className={`w-3 h-3 rounded-full inline-block mr-2 ${
              isGreen && !finish && timeRemaining > 0 ? "bg-[#4CAF50]" : "bg-[#f44336]"
            }`}></span>
            <span className="text-[#d1d0c5]">{
              finish || timeRemaining <= 0 
                ? "Game Over" 
                : isGreen ? "Green" : "Red"
            }</span>
          </div>
          <div>
            <span className="text-[#646669]">time: </span>
            <span className="text-[#d1d0c5]">{Math.max(0, Math.round(timeRemaining))}s</span>
          </div>
        </div>

        {/* Messages */}
        {isDisabled && countdown > 0 && (
          <div className="mt-4 text-[#ca4754] font-mono">
            Typing is disabled. Please wait {countdown} seconds.
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full p-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
        </div>
        <div className="flex items-center gap-4">
        </div>
      </footer>

      <style jsx global>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
        .scroll-smooth {
          scroll-behavior: smooth;
          contain: content;
        }
        @keyframes glow {
          0%, 100% { 
            opacity: 1;
          }
          50% { 
            opacity: 0.8;
          }
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
          contain: paint;
        }
      `}</style>
    </div>
  );
}
