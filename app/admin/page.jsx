"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";

export default function AdminDashboard({ params }) {
  const [players, setPlayers] = useState("");
  const [password, setPassword] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [slots, setSlots] = useState([]);

  const { id } = use(params);

  // Fetch all slots on component mount
  useEffect(() => {
    fetchSlots();
  }, []);

  // Fetch slots from the API
  const fetchSlots = async () => {
    try {
      const response = await axios.get("/api/admin/slot");
      if (response.status === 200) {
        setSlots(response.data.slots);
      } else {
        console.log("Failed to fetch slots");
      }
    } catch (error) {
      console.log("Error fetching slots:", error);
    }
  };

  // Handle slot creation
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/admin/slot", {
        players,
        password,
        startTime,
        endTime,
      });

      if (response.status === 201) {
        console.log("Slot created successfully");
        fetchSlots(); // Refresh the slot list
      } else {
        console.log("Failed to create slot");
      }
    } catch (error) {
      console.log("Error creating slot:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Admin Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="players">Number of Players</Label>
              <Input
                id="players"
                type="number"
                placeholder="Enter number of players"
                value={players}
                onChange={(e) => setPlayers(e.target.value)}
                required
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                Create Slot
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>

      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold">All Slots</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="border px-4 py-2">Slot ID</th>
                <th className="border px-4 py-2">Players</th>
                <th className="border px-4 py-2">Password</th>
                <th className="border px-4 py-2">Start Time</th>
                <th className="border px-4 py-2">End Time</th>
                <th className="border px-4 py-2">View</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.slotId}>
                  <td className="border px-4 py-2">{slot.slotId}</td>
                  <td className="border px-4 py-2">{slot.players}</td>
                  <td className="border px-4 py-2">{slot.password}</td>
                  <td className="border px-4 py-2">{slot.startTime}</td>
                  <td className="border px-4 py-2">{slot.endTime}</td>
                  <td className="border px-4 py-2">
                    <Link
                      href={`/admin/slot/${slot.slotId}`}
                      className="text-blue-500 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
