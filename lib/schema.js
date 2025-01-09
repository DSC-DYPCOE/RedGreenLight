import { Schema, model, models } from "mongoose";

// Define slot and user models

const SlotSchema = new Schema({
  slotId: { type: Number, unique: true, required: true },
  startTime: { type: String, required: true },  // The actual slot start time in Date format
  endTime: { type: String, required: true },    // The slot end time in Date format
  players: { type: Number, required: true },
  password: { type: String, required: true },
  leaderboard: [
    {
      username: { type: String, required: true },
      score: { type: Number, required: true },
    },
  ],
});

export const Slot = models.Slot || model("Slot", SlotSchema);
