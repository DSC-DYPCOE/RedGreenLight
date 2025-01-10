import { NextResponse } from "next/server";
import { Slot } from "@/lib/schema.js";
import dbConnect from "@/lib/db.js";

export async function POST(req) {
  try {
    await dbConnect(); // Ensure database connection is established

    const { username, password, slotId } = await req.json();

    // Find the slot by slotId
    const slot = await Slot.findOne({ slotId });
    if (!slot) {
      return NextResponse.json({ message: "Slot not found" }, { status: 404 });
    }

    // Check if the password matches
    if (password !== slot.password) {
      return NextResponse.json({ message: "Invalid password" }, { status: 403 });
    }

    // Check if the username already exists in the leaderboard
    const userExists = slot.leaderboard.some((entry) => entry.username === username);
    if (userExists) {
      return NextResponse.json({ message: "Username already exists in the leaderboard" }, { status: 409 });
    }

    // Add user to the leaderboard with default score
    await Slot.updateOne(
      { slotId },
      { $push: { leaderboard: { username, score: 0 } } }
    );

    return NextResponse.json(
      { message: "User added to leaderboard successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to update leaderboard. Please try again." },
      { status: 500 }
    );
  }
}
