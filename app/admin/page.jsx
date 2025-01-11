"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import axios from "axios";

export default function AdminDashboard({ params }) {
  const [players, setPlayers] = useState("");
  const [password, setPassword] = useState("");
  const [startHours, setStartHours] = useState("");
  const [startMinutes, setStartMinutes] = useState("");
  const [endHours, setEndHours] = useState("");
  const [endMinutes, setEndMinutes] = useState("");
  const [slots, setSlots] = useState([]);

  const { id } = use(params);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await axios.get("/api/admin/slot");
      if (response.status === 200) {
        setSlots(response.data.slots);
      }
    } catch (error) {
      console.log("Error fetching slots:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const startTime = `${startHours.padStart(2, '0')}:${startMinutes.padStart(2, '0')}`;
    const endTime = `${endHours.padStart(2, '0')}:${endMinutes.padStart(2, '0')}`;

    try {
      const response = await axios.post("/api/admin/slot", {
        players,
        password,
        startTime,
        endTime,
      });

      if (response.status === 201) {
        console.log("Slot created successfully");
        fetchSlots();
      }
    } catch (error) {
      console.log("Error creating slot:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#323437] text-[#646669]">
      {/* Top Navigation */}
      <nav className="w-full p-4 flex items-center justify-between border-b border-[#2c2e31]">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-[#d1d0c5] font-bold text-xl font-mono">
            RedGreenType
          </Link>
          <span className="text-[#e2b714] font-mono">admin</span>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Create Slot Form */}
          <div className="bg-[#2c2e31] p-6 rounded-lg mb-8">
            <h2 className="text-[#d1d0c5] text-xl font-mono mb-6">create slot</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[#646669] font-mono text-sm mb-1 block">players</label>
                <input
                  type="number"
                  value={players}
                  onChange={(e) => setPlayers(e.target.value)}
                  required
                  min="1"
                  className="w-full bg-[#323437] text-[#d1d0c5] font-mono p-2 rounded border border-[#646669] focus:outline-none focus:border-[#e2b714]"
                />
              </div>

              <div>
                <label className="text-[#646669] font-mono text-sm mb-1 block">password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#323437] text-[#d1d0c5] font-mono p-2 rounded border border-[#646669] focus:outline-none focus:border-[#e2b714]"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[#646669] font-mono text-sm mb-1 block">start time</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      placeholder="HH"
                      value={startHours}
                      onChange={(e) => setStartHours(e.target.value)}
                      required
                      className="w-full bg-[#323437] text-[#d1d0c5] font-mono p-2 rounded border border-[#646669] focus:outline-none focus:border-[#e2b714]"
                    />
                    <input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="MM"
                      value={startMinutes}
                      onChange={(e) => setStartMinutes(e.target.value)}
                      required
                      className="w-full bg-[#323437] text-[#d1d0c5] font-mono p-2 rounded border border-[#646669] focus:outline-none focus:border-[#e2b714]"
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <label className="text-[#646669] font-mono text-sm mb-1 block">end time</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      placeholder="HH"
                      value={endHours}
                      onChange={(e) => setEndHours(e.target.value)}
                      required
                      className="w-full bg-[#323437] text-[#d1d0c5] font-mono p-2 rounded border border-[#646669] focus:outline-none focus:border-[#e2b714]"
                    />
                    <input
                      type="number"
                      min="0"
                      max="59"
                      placeholder="MM"
                      value={endMinutes}
                      onChange={(e) => setEndMinutes(e.target.value)}
                      required
                      className="w-full bg-[#323437] text-[#d1d0c5] font-mono p-2 rounded border border-[#646669] focus:outline-none focus:border-[#e2b714]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#2c2e31] text-[#d1d0c5] hover:bg-[#363739] font-mono px-6 py-2 rounded transition-colors duration-200 border border-[#646669] hover:border-[#e2b714]"
              >
                create slot
              </button>
            </form>
          </div>

          {/* Slots Table */}
          <div className="bg-[#2c2e31] p-6 rounded-lg">
            <h2 className="text-[#d1d0c5] text-xl font-mono mb-6">all slots</h2>
            <div className="overflow-x-auto">
              <table className="w-full font-mono">
                <thead>
                  <tr className="text-[#646669] text-left">
                    <th className="p-2 border-b border-[#646669]">id</th>
                    <th className="p-2 border-b border-[#646669]">players</th>
                    <th className="p-2 border-b border-[#646669]">password</th>
                    <th className="p-2 border-b border-[#646669]">start</th>
                    <th className="p-2 border-b border-[#646669]">end</th>
                    <th className="p-2 border-b border-[#646669]">actions</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => (
                    <tr key={slot.slotId} className="text-[#d1d0c5] hover:bg-[#363739]">
                      <td className="p-2 border-b border-[#2c2e31]">{slot.slotId}</td>
                      <td className="p-2 border-b border-[#2c2e31]">{slot.players}</td>
                      <td className="p-2 border-b border-[#2c2e31]">{slot.password}</td>
                      <td className="p-2 border-b border-[#2c2e31]">{slot.startTime}</td>
                      <td className="p-2 border-b border-[#2c2e31]">{slot.endTime}</td>
                      <td className="p-2 border-b border-[#2c2e31]">
                        <Link
                          href={`/admin/slot/${slot.slotId}`}
                          className="text-[#e2b714] hover:text-[#d1d0c5] transition-colors duration-200"
                        >
                          view
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
