"use client";

import { useState, useEffect, use } from "react";
import { io } from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import Cookies from "js-cookie";

const socket = io("https://redgreenlightsocket-t7on.onrender.com");

export default function TypingTest({ params }) {
  const [slotText, setSlotText] = useState(""); // Slot-specific paragraph
  const [userInput, setUserInput] = useState(""); // User's typing input
  const [score, setScore] = useState(0); // Typing test score
  const [isGreen, setIsGreen] = useState(false); // Light state
  const [isDisabled, setIsDisabled] = useState(true); // Disable textarea initially
  const [countdown, setCountdown] = useState(0); // Countdown timer
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTimeReached, setStartTimeReached] = useState(false); // Flag for start time
  const [finish, setFinish] = useState(false);
  const { id } = use(params); // Slot ID

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

        // Handle end time crossing midnight
        if (endDate < startDate) {
          endDate.setDate(endDate.getDate() + 1);
        }

        const currentTime = new Date();
        const timeUntilStart = (startDate - currentTime) / 1000; // Time until start in seconds
        const timeLeft = Math.max((endDate - currentTime) / 1000, 0); // Time left in seconds

        setTimeRemaining(timeLeft);

        // If the start time has already passed
        if (timeUntilStart <= 0) {
          console.log(timeUntilStart);
          setStartTimeReached(true);
          setIsDisabled(false); // Enable textarea
        } else {
          // Schedule start time logic
          setTimeout(() => {
            setStartTimeReached(true);
            setIsDisabled(false); // Enable textarea
          }, timeUntilStart * 1000);
        }

        // Handle end time logic
        if (timeLeft > 0) {
          const interval = setInterval(() => {
            setTimeRemaining((prev) => {
              if (prev <= 1) {
                clearInterval(interval);
                setIsDisabled(true); // Disable textarea at end time
                setFinish(true);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          return () => clearInterval(interval); // Cleanup timer
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
    console.log(startTimeReached);
    if (startTimeReached && timeRemaining > 0) {
      socket.emit("request-light-state", { slotId: id });

      socket.on("light-state", (data) => {
        console.log(data);
        if (data.slotId === id) {
          setSlotText(data.paragraph); // Set the assigned paragraph
          setIsGreen(data.isGreen); // Set the initial light state
          if (!data.isGreen) {
            handleDisableInput();
          }
        }
      });

      socket.on("light-toggle", (data) => {
        if (data.slotId === id) {
          setIsGreen(data.isGreen); // Update light state on toggle
          if (!data.isGreen) {
            handleDisableInput();
          } else {
            if (countdown <= 0) {
              setIsDisabled(false); // Re-enable typing if light turns green
            }
          }
        }
      });

      return () => {
        socket.off("light-state");
        socket.off("light-toggle");
      };
    }
  }, [id, isGreen, countdown, startTimeReached]);
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

  const handleDisableInput = () => {
    setIsDisabled(true);
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Typing Test</CardTitle>
          <CardTitle>{remainingTime()}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Display the assigned paragraph */}
          <p className="mb-4 text-gray-700">{slotText}</p>

          {/* Textarea for user input */}
          <Textarea
            placeholder={
              isDisabled
                ? `Disabled for ${countdown} seconds...`
                : "Start typing here..."
            }
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isDisabled || finish || timeRemaining <= 0}
            onCopy={(e) => {
              e.preventDefault();
            }}
            onPaste={(e) => {
              e.preventDefault();
            }}
            className={`mb-4 ${
              isDisabled ? "bg-gray-300 cursor-not-allowed" : ""
            }`}
          />

          {/* Display typing score */}
          <p>
            <strong>Score:</strong> {score}
          </p>

          {/* Light state display */}
          <div className="mt-4">
            <div
              className={`w-10 h-10 rounded-full ${
                isGreen ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <p className="mt-2 text-sm text-gray-600">
              Light is currently {isGreen ? "Green" : "Red"}
            </p>
          </div>

          {/* Countdown timer */}
          {isDisabled && countdown > 0 && (
            <p className="mt-4 text-sm text-red-500">
              Typing is disabled. Please wait {countdown} seconds.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
