"use client";

import { useState, useEffect, use } from "react";
import { io } from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const socket = io("http://localhost:3000");

export default function TypingTest({ params }) {
  const [slotText, setSlotText] = useState(""); // Slot-specific paragraph
  const [userInput, setUserInput] = useState(""); // User's typing input
  const [score, setScore] = useState(0); // Typing test score
  const [isGreen, setIsGreen] = useState(false); // Light state
  const [isDisabled, setIsDisabled] = useState(false); // Disable textarea
  const [countdown, setCountdown] = useState(0); // Countdown timer
  const { id } = use(params); // Slot ID

  useEffect(() => {
    // Request initial data when the component mounts
    socket.emit("request-light-state", { slotId: id });

    // Listen for paragraph and light state updates
    socket.on("light-state", (data) => {
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
          console.log(countdown);
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
  }, [id, isGreen, countdown]);

  useEffect(() => {
    // Calculate typing score based on correct characters
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
  useEffect(() => {
    document.onkeydown = handleBan;
    return () => (document.onkeydown = null);
  }, [isGreen, countdown]);
  const handleBan = (key) => {
    if (!isGreen && countdown == 0) {
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

  return (
    <div onKeyDown={handleBan}>
      <Card>
        <CardHeader>
          <CardTitle>Typing Test</CardTitle>
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
            disabled={isDisabled}
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
