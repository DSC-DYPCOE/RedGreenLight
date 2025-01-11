"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const statusColors = {
  completed: "bg-gray-500",
  upcoming: "bg-indigo-500",
  live: "bg-emerald-500",
};

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
    >
      <Card className="mb-6 shadow-lg rounded-lg overflow-hidden bg-white dark:bg-gray-800 transform hover:scale-105 transition-transform duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Slot {slot.slotId}</h3>
              <p className="text-gray-600 dark:text-gray-300">Start: {slot.startTime}</p>
              <p className="text-gray-600 dark:text-gray-300">End: {slot.endTime}</p>
              <p className="text-gray-600 dark:text-gray-300">Players: {slot.numberOfPlayers}</p>
            </div>
            <div className="flex flex-col items-end space-y-4">
              <Badge
                className={`${statusColors[status]} text-white px-3 py-1 rounded-full text-sm font-semibold`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
              <Button
                onClick={() => onJoin(slot.slotId)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 rounded-full px-6 py-2 shadow-md transform hover:scale-105 transition-all duration-300"
              >
                Join Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 dark:from-gray-900 dark:to-purple-900">
      <div className="container mx-auto px-4 py-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl font-extrabold text-center mb-10 text-gray-800 dark:text-white"
        >
          Available Slots
        </motion.h1>
        <AnimatePresence>
          {slots.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-gray-600 dark:text-gray-300"
            >
              No slots available
            </motion.p>
          ) : (
            slots.map((slot) => (
              <SlotCard key={slot._id} slot={slot} onJoin={handleJoin} />
            ))
          )}
        </AnimatePresence>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-white">Join Slot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)} variant="outline" className="text-gray-600 dark:text-gray-300">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              Join
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

