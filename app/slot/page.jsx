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
      className="mb-4 relative"
    >
      <div className="bg-[#1a1b1e] p-6 rounded-lg hover:bg-[#242528] transition-colors duration-200 border border-[#f72585]/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[#f72585] text-xl font-mono mb-2 flex items-center gap-2">
              <span className="text-2xl">◯</span>
              Slot {slot.slotId}
            </h3>
            <p className="text-[#94a1b2] font-mono flex items-center gap-2">
              <span className="text-[#f72585]">▢</span>
              Start: {slot.startTime}
            </p>
            <p className="text-[#94a1b2] font-mono flex items-center gap-2">
              <span className="text-[#f72585]">△</span>
              End: {slot.endTime}
            </p>
            <p className="text-[#94a1b2] font-mono">Players: {slot.numberOfPlayers}</p>
          </div>
          <div className="flex flex-col items-end space-y-4">
            <span className={`px-3 py-1 rounded text-sm font-mono ${
              status === 'live' ? 'text-[#4CAF50] bg-[#4CAF50]/10' :
              status === 'upcoming' ? 'text-[#f72585] bg-[#f72585]/10' :
              'text-[#94a1b2] bg-[#94a1b2]/10'
            }`}>
              {status.toUpperCase()}
            </span>
            <button
              onClick={() => onJoin(slot.slotId)}
              className="bg-[#f72585] text-white hover:bg-[#f72585]/90 font-mono px-6 py-2 rounded transition-colors duration-200"
            >
              join game
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
        // Sort slots by slotId in descending order (newest first)
        const sortedSlots = response.data.slots.sort((a, b) => b.slotId - a.slotId);
        setSlots(sortedSlots);
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
    <div className="min-h-screen bg-[#16161a] text-[#94a1b2] relative overflow-hidden">
      {/* Decorative Shapes */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-40 h-40 border-4 border-[#f72585]/20 rounded-full"></div>
        <div className="absolute top-40 right-40 w-32 h-32 border-4 border-[#f72585]/20 transform rotate-45"></div>
        <div className="absolute bottom-40 left-1/4 w-36 h-36 border-4 border-[#f72585]/20 transform rotate-[30deg]"></div>
      </div>

      {/* Top Navigation */}
      <nav className="w-full p-4 flex items-center justify-between border-b border-[#f72585]/10 relative z-10 backdrop-blur-sm bg-[#16161a]/80">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-[#f72585] font-bold text-xl font-mono flex items-center gap-2">
            <span className="text-2xl">◯</span>
            RedGreenType
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#94a1b2] font-mono">english</span>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <h1 className="text-[#f72585] text-2xl font-mono text-center mb-12 flex items-center justify-center gap-4">
          <span className="text-3xl">△</span>
          available slots
          <span className="text-3xl">▢</span>
        </h1>
        
        <div className="max-w-3xl mx-auto">
          <AnimatePresence>
            {slots.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-[#94a1b2] font-mono"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#1a1b1e] p-8 rounded-lg w-96 border border-[#f72585]/20"
          >
            <h2 className="text-[#f72585] text-xl font-mono mb-6 flex items-center gap-2">
              <span className="text-2xl">◯</span>
              join slot
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#16161a] text-[#94a1b2] font-mono p-3 rounded border border-[#f72585]/20 focus:outline-none focus:border-[#f72585] transition-colors duration-200"
              />
              <input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#16161a] text-[#94a1b2] font-mono p-3 rounded border border-[#f72585]/20 focus:outline-none focus:border-[#f72585] transition-colors duration-200"
              />
              {error && <p className="text-[#ff2e63] text-sm font-mono">{error}</p>}
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setDialogOpen(false)}
                className="text-[#94a1b2] font-mono hover:text-[#f72585] transition-colors duration-200"
              >
                cancel
              </button>
              <button
                onClick={handleSubmit}
                className="bg-[#f72585] text-white hover:bg-[#f72585]/90 font-mono px-6 py-2 rounded transition-colors duration-200"
              >
                join
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
