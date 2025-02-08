'use client';

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import axios from "axios";
import Link from "next/link";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

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
  const { id } = use(params);

  useEffect(() => {
    socket.emit("request-light-state", { slotId: id });

    socket.on("light-state", (data) => {
      if (data.slotId === id) {
        setIsGreen(data.isGreen);
      }
    });

    socket.on("light-toggle", (data) => {
      if (data.slotId === id) {
        setIsGreen(data.isGreen);
      }
    });

    return () => {
      socket.off("light-state");
      socket.off("light-toggle");
    };
  }, [id]);

  const toggleLight = () => {
    console.log(id)
    socket.emit("toggle-light", { slotId: id });
  };

  useEffect(() => {
    const fetchSlotInfo = async () => {
      try {
        const response = await axios.get(`/api/admin/slot/${id}`);
        if (response.status === 200) {
          setSlot(response.data);
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
    <div className="min-h-screen bg-[#323437] text-[#646669]">
      {/* Top Navigation */}
      <nav className="w-full p-4 flex items-center justify-between border-b border-[#2c2e31]">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-[#d1d0c5] font-bold text-xl font-mono">
            TypeToSurvive
          </Link>
          <span className="text-[#e2b714] font-mono">admin</span>
          <span className="text-[#646669] font-mono">slot {id}</span>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Slot Information */}
          <div className="bg-[#2c2e31] p-6 rounded-lg">
            <h2 className="text-[#d1d0c5] text-xl font-mono mb-6">slot information</h2>
            <div className="grid grid-cols-2 gap-4 font-mono">
              <div>
                <span className="text-[#646669]">id: </span>
                <span className="text-[#d1d0c5]">{slot.slotId}</span>
              </div>
              <div>
                <span className="text-[#646669]">players: </span>
                <span className="text-[#d1d0c5]">{slot.players}</span>
              </div>
              <div>
                <span className="text-[#646669]">password: </span>
                <span className="text-[#d1d0c5]">{slot.password}</span>
              </div>
              <div>
                <span className="text-[#646669]">start: </span>
                <span className="text-[#d1d0c5]">{slot.startTime}</span>
              </div>
              <div>
                <span className="text-[#646669]">end: </span>
                <span className="text-[#d1d0c5]">{slot.endTime}</span>
              </div>
              <div>
                <span className="text-[#646669]">status: </span>
                <span className={isGreen ? "text-[#4CAF50]" : "text-[#ca4754]"}>
                  {isGreen ? "green" : "red"}
                </span>
              </div>
            </div>
          </div>

          {/* Light Control */}
          <div className="bg-[#2c2e31] p-6 rounded-lg">
            <h2 className="text-[#d1d0c5] text-xl font-mono mb-6">light control</h2>
            <button
              onClick={toggleLight}
              className={`w-full font-mono px-6 py-3 rounded transition-colors duration-200 border ${
                isGreen 
                  ? "border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-[#323437]" 
                  : "border-[#ca4754] text-[#ca4754] hover:bg-[#ca4754] hover:text-[#323437]"
              }`}
            >
              {isGreen ? "turn red" : "turn green"}
            </button>
          </div>

          {/* Leaderboard */}
          <div className="bg-[#2c2e31] p-6 rounded-lg">
            <h2 className="text-[#d1d0c5] text-xl font-mono mb-6">leaderboard</h2>
            {slot.leaderboard.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full font-mono">
                  <thead>
                    <tr className="text-[#646669] text-left">
                      <th className="p-2 border-b border-[#646669]">rank</th>
                      <th className="p-2 border-b border-[#646669]">player</th>
                      <th className="p-2 border-b border-[#646669]">score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slot.leaderboard.map((entry, index) => (
                      <tr key={index} className="text-[#d1d0c5] hover:bg-[#363739]">
                        <td className="p-2 border-b border-[#2c2e31]">{index + 1}</td>
                        <td className="p-2 border-b border-[#2c2e31]">{entry.username}</td>
                        <td className="p-2 border-b border-[#2c2e31]">{entry.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-[#646669] font-mono">no players yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
