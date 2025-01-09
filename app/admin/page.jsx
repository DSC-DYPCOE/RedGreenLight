"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [time, setTime] = useState("");
  const [players, setPlayers] = useState("");
  const [password, setPassword] = useState("");
  const [slots, setSlots] = useState([]);

  // Fetch all slots on component mount
  useEffect(() => {
    fetchSlots();
  }, []);

  // Fetch slots from the API
  const fetchSlots = async () => {
    try {
      const response = await fetch("/api/admin/slot", { method: "GET" });
      if (response.ok) {
        const data = await response.json();
        setSlots(data.slots);
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
      const response = await fetch("/api/admin/slot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time, players, password }),
      });

      if (response.ok) {
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
          <CardTitle className="text-2xl font-bold text-center">Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="time">Time Slot</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>

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

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white">
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
                <th className="border px-4 py-2">Time</th>
                <th className="border px-4 py-2">Players</th>
                <th className="border px-4 py-2">Password</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.slotId}>
                  <td className="border px-4 py-2">{slot.slotId}</td>
                  <td className="border px-4 py-2">{slot.time}</td>
                  <td className="border px-4 py-2">{slot.players}</td>
                  <td className="border px-4 py-2">{slot.password}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
