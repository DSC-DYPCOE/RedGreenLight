'use client';

import { useState, useEffect,use } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";

export default function SlotInfo({ params }) {
  const [slot, setSlot] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [isGreen, setIsGreen] = useState(false);
  const { id } = use(params);

  useEffect(() => {
    // Fetch information for a particular slot
    const fetchSlotInfo = async () => {
      try {
        const response = await axios.get(`/api/admin/slot/${id}`);
        if (response.status === 200) {
          setSlot(response.data);
        } else {
          console.log("Failed to fetch slot information");
        }
      } catch (error) {
        console.log("Error fetching slot information:", error);
      }
    };

    // Fetch leaderboard data (you can replace with dynamic data)
    const fetchLeaderboard = async () => {
      // Mock leaderboard data
      setLeaderboard([
        { rank: 1, player: "John Doe", score: 1500 },
        { rank: 2, player: "Jane Smith", score: 1400 },
        { rank: 3, player: "Alice Johnson", score: 1300 },
      ]);
    };

    if (id) {
      fetchSlotInfo();
      fetchLeaderboard();
    }
  }, [id]);

  const toggleButton = () => {
    setIsGreen(!isGreen);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-4xl mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Slot Information</CardTitle>
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

      {/* Toggle Button for Light */}
      <div className="mt-6">
        <motion.div
          onClick={toggleButton}
          className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer ${
            isGreen ? "bg-green-500" : "bg-red-500"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-white font-bold">
            {isGreen ? "Green" : "Red"}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
