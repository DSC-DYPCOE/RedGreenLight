'use client';

import { useState, useEffect,use } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:3000"); // Connect to your socket server

export default function SlotInfo({ params }) {
  const [slot, setSlot] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [isGreen, setIsGreen] = useState(false);
  const { id } = use(params); // Slot ID

  useEffect(() => {
    // Request initial light state and set up listeners
    socket.emit("request-light-state", { slotId: id });

    socket.on("light-state", (data) => {
      if (data.slotId === id) {
        setIsGreen(data.isGreen); // Set the initial light state
      }
    });

    socket.on("light-toggle", (data) => {
      if (data.slotId === id) {
        setIsGreen(data.isGreen); // Update light state on toggle
      }
    });

    return () => {
      socket.off("light-state");
      socket.off("light-toggle");
    };
  }, [id]);

  const toggleLight = () => {
    // Emit the toggle-light event to the server
    socket.emit("toggle-light", { slotId: id });
  };

  useEffect(() => {
    // Fetch slot information
    const fetchSlotInfo = async () => {
      try {
        const response = await axios.get(`/api/admin/slot/${id}`);
        if (response.status === 200) {
          setSlot(response.data);
        } else {
          console.error("Failed to fetch slot information");
        }
      } catch (error) {
        console.error("Error fetching slot information:", error);
      }
    };

    // Fetch leaderboard data
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(`/api/admin/leaderboard/${id}`);
        if (response.status === 200) {
          setLeaderboard(response.data.leaderboard);
        } else {
          console.error("Failed to fetch leaderboard");
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    };

    if (id) {
      fetchSlotInfo();
      fetchLeaderboard();
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {/* Slot Information */}
      <Card className="w-full max-w-4xl mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Slot Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Slot ID:</strong> {slot.slotId}</p>
            <p><strong>Players:</strong> {slot.players}</p>
            <p><strong>Password:</strong> {slot.password}</p>
            <p><strong>Start Time:</strong> {slot.startTime}</p>
            <p><strong>End Time:</strong> {slot.endTime}</p>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="w-full max-w-4xl mt-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="border px-4 py-2">Rank</th>
                <th className="border px-4 py-2">Player</th>
                <th className="border px-4 py-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr key={entry.rank}>
                  <td className="border px-4 py-2">{entry.rank}</td>
                  <td className="border px-4 py-2">{entry.player}</td>
                  <td className="border px-4 py-2">{entry.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Admin Toggle Light */}
      <div className="mt-6">
        <motion.button
          onClick={toggleLight}
          className={`px-4 py-2 rounded-md font-bold text-white ${
            isGreen ? "bg-green-500" : "bg-red-500"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isGreen ? "Turn Red" : "Turn Green"}
        </motion.button>
      </div>
    </div>
  );
}
