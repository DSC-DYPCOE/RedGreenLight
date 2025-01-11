"use client";

import { useState, useEffect, use } from "react";
import { io } from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import Cookies from "js-cookie";
import { Howl } from "howler"; // Import Howler for audio playback

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

// Import audio files
const greenSound = new Howl({ src: ["/green.mp3"] });
const redSound = new Howl({ src: ["/red.mp3"] });
const shotSound = new Howl({ src: ["/shot.mp3"] ,});
const mainLoop = new Howl({
  src: ["/main.m4a"],
  loop: true, // Loop the main sound
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
  const { id } = use(params);

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
    if (startTimeReached && timeRemaining > 0) {
      document.onkeydown = handleBan;
      return () => (document.onkeydown = null);
    }
  }, [isGreen, countdown, startTimeReached]);

  const handleBan = () => {
    if (!isGreen && countdown === 0) {
      setCountdown(30);
      setScore((prev) => prev - 5);
      shotSound.play();
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  useEffect(() => {
    if (slotText) {
      const correctChars = userInput
        .split("")
        .filter((char, index) => char === slotText[index]).length;
      setScore(correctChars);
    }
  }, [userInput, slotText]);

  return (
    <div>
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">Typing Test</CardTitle>
          <CardTitle className="text-sm text-gray-600">{remainingTime()}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-gray-700">{slotText}</p>
          <Textarea
            placeholder={isDisabled ? `Disabled for ${countdown} seconds...` : "Start typing here..."}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isDisabled || finish || timeRemaining <= 0}
            className={`mb-4 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${
              isDisabled ? "bg-gray-300 cursor-not-allowed" : ""
            }`}
          />
          <p><strong>Score:</strong> {score}</p>
          <div className="mt-4">
            <div className={`w-10 h-10 rounded-full ${isGreen ? "bg-green-500" : "bg-red-500"}`}></div>
            <p className="mt-2 text-sm text-gray-600">Light is currently {isGreen ? "Green" : "Red"}</p>
          </div>
          {isDisabled && countdown > 0 && (
            <p className="mt-4 text-sm text-red-500">Typing is disabled. Please wait {countdown} seconds.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
