'use client';

import { useState, useEffect ,use} from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("https://redgreenlightsocket-t7on.onrender.com"); // Connect to your socket server

export default function SlotInfo({ params }) {
  const [slot, setSlot] = useState({
    slotId: "",
    startTime: "",
    endTime: "",
    players: 0,
    password: "",
    leaderboard: [],
  });
  const [isGreen, setIsGreen] = useState(false);
  const { id } = use(params); // Slot ID from params

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
    // Fetch slot information and leaderboard
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

    if (id) {
      fetchSlotInfo();
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {/* Slot Information */}
      <Card className="w-full max-w-4xl mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Slot Information (Admin View)
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
      {/* Leaderboard */}
      <Card className="w-full max-w-4xl mt-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          {slot.leaderboard.length > 0 ? (
            <table className="w-full table-auto border-collapse text-center">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Rank</th>
                  <th className="border px-4 py-2">Player</th>
                  <th className="border px-4 py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {slot.leaderboard.map((entry, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">{index + 1}</td>
                    <td className="border px-4 py-2">{entry.username}</td>
                    <td className="border px-4 py-2">{entry.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500">No players yet.</p>
          )}
        </CardContent>
      </Card>

    
    </div>
  );
}
