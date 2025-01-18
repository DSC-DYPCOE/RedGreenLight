"use client";

import { useState, useEffect, use } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import Cookies from "js-cookie";
import { Howl } from "howler";
import Link from "next/link";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

// Import audio files
const greenSound = new Howl({ src: ["/green.mp3"] });
const redSound = new Howl({ src: ["/red.mp3"] });
const shotSound = new Howl({ src: ["/shot.mp3"] });
const mainLoop = new Howl({
  src: ["/main.m4a"],
  loop: true,
});

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
  const { id } = use(params);

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

  useEffect(() => {
    const fetchSlotData = async () => {
      try {
        const response = await axios.get(`/api/slots/${id}`);
        const { startTime, endTime } = response.data;

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

        if (timeLeft > 0) {
          const interval = setInterval(() => {
            setTimeRemaining((prev) => {
              if (prev <= 1) {
                clearInterval(interval);
                setIsDisabled(true);
                setFinish(true);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          return () => clearInterval(interval);
        }
      } catch (error) {
        console.error("Failed to fetch slot data:", error);
      }
    };

    fetchSlotData();
  }, [id]);

  useEffect(() => {
    if (finish) {
      updateLeaderboard();
    }
  }, [score, finish]);

  const updateLeaderboard = async () => {
    const username = Cookies.get("username");
    if (!username) {
      console.error("Username not found in cookies.");
      return;
    }
    try {
      const payload = {
        username,
        slotId: id,
        score,
      };
      const response = await axios.patch("/api/admin/slot", payload);
      if (response.status === 200) {
        console.log("Leaderboard updated successfully.");
      } else {
        console.error("Failed to update leaderboard.");
      }
    } catch (error) {
      console.error("Error updating leaderboard:", error);
    }
  };

  const remainingTime = () => {
    if (timeRemaining <= 0) {
      return "Test has ended.";
    }
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = Math.floor(timeRemaining % 60);
    return `Time remaining: ${minutes}m ${seconds}s`;
  };

  useEffect(() => {
    if (startTimeReached && timeRemaining > 0) {
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
  }, [id, startTimeReached, timeRemaining]);

  const handleLightToggle = (isGreenState) => {
    setIsGreen(isGreenState);
  
    if (isGreenState) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  };

  useEffect(()=>{
if(isGreen){
  if (!greenSound.playing()) {
    greenSound.play();
   
  }
  if (!mainLoop.playing()) {
    mainLoop.play();
  }

}
else{
  if (!redSound.playing()) {
    redSound.play();
  }
  if (mainLoop.playing()) {
    mainLoop.stop();
  }
 
}
  },[isGreen])

  useEffect(() => {
    if (slotText) {
      const lastInputChar = userInput[userInput.length - 1];
      const lastCharIndex = userInput.length - 1;
      
      if (lastInputChar) {
        if (!isGreen) {
          // Red light penalty
          setScore(prev => prev - 5);
          shotSound.play();
        } else {
          // Green light scoring
          if (lastInputChar === slotText[lastCharIndex]) {
            // Correct character during green light
            setScore(prev => prev + 1);
          } else {
            // Mistyped character during green light
            setScore(prev => prev - 1);
          }
        }
      }
    }
  }, [userInput, slotText, isGreen]);

  return (
    <div className="min-h-screen bg-[#323437] text-[#646669] flex flex-col">
      {/* Top Navigation */}
      <nav className="w-full p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-[#d1d0c5] font-bold text-xl">
            RedGreenType
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <button className="px-3 py-1 rounded bg-[#2c2e31] text-[#646669]">@ punctuation</button>
            <button className="px-3 py-1 rounded bg-[#2c2e31] text-[#646669]"># numbers</button>
            <button className="px-3 py-1 rounded bg-[#2c2e31] text-[#e2b714]">time {timeRemaining}s</button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#646669]">english</span>
        </div>
      </nav>

      {/* Main Content */}
      <main 
        className="flex-1 flex flex-col items-center justify-center px-4 -mt-20"
        tabIndex={0}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        {/* Text Display */}
        <div className="max-w-[1200px] w-full mb-8 text-center relative">
          {!isFocused && (
            <div className="absolute inset-0 flex items-center justify-center text-[#646669] text-lg">
              Click here or press any key to focus
            </div>
          )}
          <div 
            className={`text-3xl font-mono tracking-wide leading-relaxed flex flex-wrap justify-center gap-x-2 ${isFocused ? '' : 'opacity-50'}`}
          >
            {slotText.split('').map((char, i) => (
              <span 
                key={i} 
                className={`${
                  i < userInput.length 
                    ? userInput[i] === char
                      ? 'text-[#d1d0c5]' 
                      : 'text-[#ca4754]'
                    : 'text-[#646669]'
                } ${i === userInput.length ? 'relative' : ''}`}
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
            <span className={`w-3 h-3 rounded-full inline-block mr-2 ${isGreen ? "bg-[#4CAF50]" : "bg-[#f44336]"}`}></span>
            <span className="text-[#d1d0c5]">{isGreen ? "Green" : "Red"}</span>
          </div>
        </div>

        {/* Messages */}
        {isDisabled && countdown > 0 && (
          <div className="mt-4 text-[#ca4754] font-mono">
            Typing is disabled. Please wait {countdown} seconds.
          </div>
        )}

        {(finish || timeRemaining <= 0) && (
          <div className="mt-8 text-[#d1d0c5] text-xl font-mono">
            Test completed! Final score: {score}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full p-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="text-[#646669]">tab + enter - restart test</span>
          <span className="text-[#646669]">esc - command line</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#646669]">v1.0.0</span>
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
      `}</style>
    </div>
  );
}
