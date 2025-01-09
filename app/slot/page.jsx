'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from 'react'
import axios from 'axios'
import moment from 'moment';
import Link from "next/link"
const statusColors = {
  completed: 'bg-gray-500',
  upcoming: 'bg-blue-500',
  live: 'bg-green-500'
}

const SlotCard = ({ slot }) => {
    const calculateStatus = () => {
      const currentTime = moment(); // Current time
      const startTime = moment(slot.startTime, 'HH:mm'); // Parsing start time in HH:mm format
      const endTime = moment(slot.endTime, 'HH:mm'); // Parsing end time in HH:mm format
  
      if (currentTime.isBefore(startTime)) {
        return 'upcoming';
      } else if (currentTime.isBetween(startTime, endTime)) {
        return 'live';
      } else if (currentTime.isAfter(endTime)) {
        return 'completed';
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
            <Link href={`/slot/${slot.slotId}`}>
              <h3 className="text-lg font-semibold">Slot ID: {slot.slotId}</h3>
              <p className="text-gray-600">Start Time: {slot.startTime}</p>
              <p className="text-gray-600">End Time: {slot.endTime}</p>
              <p className="text-gray-600">Players: {slot.numberOfPlayers}</p>
            </Link>
            <Badge className={`${statusColors[calculateStatus()]} text-white`}>
              {calculateStatus().charAt(0).toUpperCase() + calculateStatus().slice(1)}
            </Badge>
          </CardContent>
        </Card>
      </motion.div>
    )
  }
  
export default function SlotCardsList() {
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    // Fetch slots from the API
    const fetchSlots = async () => {
      try {
        const response = await axios.get('/api/slots');  // Adjust the endpoint as necessary
        setSlots(response.data.slots);
      } catch (error) {
        console.error("Failed to fetch slots", error);
      }
    }

    fetchSlots();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Slot Cards</h2>
      {slots.length === 0 ? (
        <p>No slots available</p>
      ) : (
        slots.map((slot) => (
          <SlotCard key={slot._id} slot={slot} />
        ))
      )}
    </div>
  )
}
