"use client";

import { motion } from "framer-motion";
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

const statusColors = {
  completed: "bg-gray-500",
  upcoming: "bg-blue-500",
  live: "bg-green-500",
};

const SlotCard = ({ slot, onJoin }) => {
  const calculateStatus = () => {
    const currentTime = moment(); // Current time
    const startTime = moment(slot.startTime, "HH:mm"); // Parsing start time in HH:mm format
    const endTime = moment(slot.endTime, "HH:mm"); // Parsing end time in HH:mm format

    if (currentTime.isBefore(startTime)) {
      return "upcoming";
    } else if (currentTime.isBetween(startTime, endTime)) {
      return "live";
    } else if (currentTime.isAfter(endTime)) {
      return "completed";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-4">
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <h3 className="text-lg font-semibold">Slot ID: {slot.slotId}</h3>
            <p className="text-gray-600">Start Time: {slot.startTime}</p>
            <p className="text-gray-600">End Time: {slot.endTime}</p>
            <p className="text-gray-600">Players: {slot.numberOfPlayers}</p>
          </div>
          <div className="flex flex-col items-end">
            <Badge
              className={`${statusColors[calculateStatus()]} text-white mb-2`}
            >
              {calculateStatus().charAt(0).toUpperCase() +
                calculateStatus().slice(1)}
            </Badge>
            <Button
              onClick={() => onJoin(slot.slotId)}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              Join
            </Button>
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
  const [error, setError] = useState(""); // Error message
  const router = useRouter();
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await axios.get("/api/slots"); // Adjust the endpoint as necessary
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
    setError(""); // Reset error message
    try {
      const response = await axios.post("/api/auth", {
        slotId: selectedSlotId,
        username,
        password,
        score:0
      });

      if (response.status==200) {
        // Password is correct, set a cookie for the username
        document.cookie = `username=${username}; path=/`;
        router.push(`/slot/${selectedSlotId}`);
        setDialogOpen(false);
      } else {
        // Password is incorrect, show error message
        setError(response.data.message || "Incorrect password");
      }
    } catch (error) {
      console.log("Failed to authenticate user:", error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Slot Cards</h2>
      {slots.length === 0 ? (
        <p>No slots available</p>
      ) : (
        slots.map((slot) => (
          <SlotCard key={slot._id} slot={slot} onJoin={handleJoin} />
        ))
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Slot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Join</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
