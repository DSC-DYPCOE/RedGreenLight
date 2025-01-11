"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";

const SlotCard = ({ slot, onJoin }) => {
  const calculateStatus = () => {
    const currentTime = moment();
    const startTime = moment(slot.startTime, "HH:mm");
    const endTime = moment(slot.endTime, "HH:mm");

    if (currentTime.isBefore(startTime)) {
      return "upcoming";
    } else if (currentTime.isBetween(startTime, endTime)) {
      return "live";
    } else if (currentTime.isAfter(endTime)) {
      return "completed";
    }
  };

  const status = calculateStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mb-4"
    >
      <div className="bg-[#2c2e31] p-6 rounded-lg hover:bg-[#363739] transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[#d1d0c5] text-xl font-mono mb-2">Slot {slot.slotId}</h3>
            <p className="text-[#646669] font-mono">Start: {slot.startTime}</p>
            <p className="text-[#646669] font-mono">End: {slot.endTime}</p>
            <p className="text-[#646669] font-mono">Players: {slot.numberOfPlayers}</p>
          </div>
          <div className="flex flex-col items-end space-y-4">
            <span className={`px-3 py-1 rounded text-sm font-mono ${
              status === 'live' ? 'text-[#4CAF50]' :
              status === 'upcoming' ? 'text-[#e2b714]' :
              'text-[#646669]'
            }`}>
              {status.toUpperCase()}
            </span>
            <button
              onClick={() => onJoin(slot.slotId)}
              className="bg-[#2c2e31] text-[#d1d0c5] hover:bg-[#363739] font-mono px-6 py-2 rounded transition-colors duration-200"
            >
              join
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function SlotCardsList() {
  const [slots, setSlots] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await axios.get("/api/slots");
        setSlots(response.data.slots);
      } catch (error) {
        console.error("Failed to fetch slots", error);
      }
    };

    fetchSlots();
  }, []);

  const handleJoin = (slotId) => {
    setSelectedSlotId(slotId);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setError("");
    try {
      const response = await axios.post("/api/auth", {
        slotId: selectedSlotId,
        username,
        password,
        score: 0,
      });

      if (response.status === 200) {
        Cookies.set("username", username);
        router.push(`/slot/${selectedSlotId}`);
        setDialogOpen(false);
      } else {
        setError(response.data.message || "Incorrect password");
      }
    } catch (error) {
      console.log("Failed to authenticate user:", error);
      setError("An error occurred. Please try again.");
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
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#646669] font-mono">english</span>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-[#d1d0c5] text-2xl font-mono text-center mb-12">available slots</h1>
        
        <div className="max-w-3xl mx-auto">
          <AnimatePresence>
            {slots.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-[#646669] font-mono"
              >
                no slots available
              </motion.p>
            ) : (
              slots.map((slot) => (
                <SlotCard key={slot._id} slot={slot} onJoin={handleJoin} />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-[#2c2e31] p-6 rounded-lg w-96">
            <h2 className="text-[#d1d0c5] text-xl font-mono mb-6">join slot</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#323437] text-[#d1d0c5] font-mono p-2 rounded border border-[#646669] focus:outline-none focus:border-[#e2b714]"
              />
              <input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#323437] text-[#d1d0c5] font-mono p-2 rounded border border-[#646669] focus:outline-none focus:border-[#e2b714]"
              />
              {error && <p className="text-[#ca4754] text-sm font-mono">{error}</p>}
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setDialogOpen(false)}
                className="text-[#646669] font-mono hover:text-[#d1d0c5] transition-colors duration-200"
              >
                cancel
              </button>
              <button
                onClick={handleSubmit}
                className="bg-[#2c2e31] text-[#d1d0c5] hover:bg-[#363739] font-mono px-6 py-2 rounded transition-colors duration-200"
              >
                join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

