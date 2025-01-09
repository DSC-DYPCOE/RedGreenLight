import dbConnect from "@/lib/dbConnect";
import { Slot } from "@/lib/schema";

export async function GET(req, res) {
  try {
    await dbConnect();  // Connect to the database

    const { slotId } = req.query;
    const rounds = await Slot.findOne({ slotId });

    if (rounds.length === 0) {
      return res.status(404).json({ error: "No rounds found for this slot" });
    }

    return res.status(200).json(rounds);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch rounds" });
  }
}
