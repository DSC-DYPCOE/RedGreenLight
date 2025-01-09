import { NextResponse } from "next/server";
import { Slot } from "@/lib/schema.js";
import dbConnect  from "@/lib/db.js";

export async function POST(req) {
  try {
    dbConnect();
    const { time, players, password } = await req.json();

    // Create a new slot with a unique slotId
    const slot = await Slot.create({
      slotId: Date.now(),
      time,
      players,
      password,
    });

    // Return the newly created slot as a success response
    return NextResponse.json(slot, { status: 201 });
  } catch (error) {
    // Handle errors and return a proper error message
    console.log(error)
    return NextResponse.json(
      { error: "Failed to create slot. Please try again." },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    dbConnect();

    const { slotId, username, score } = await req.json();

    // Find the slot by slotId
    const slot = await Slot.findOne({ slotId });
    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    // Check if the user already exists in the leaderboard
    const existingUser = slot.leaderboard.find(
      (entry) => entry.username === username
    );

    slot.leaderboard.push({ username, score });

    // Sort the leaderboard by score in descending order
    slot.leaderboard.sort((a, b) => b.score - a.score);

    // Save the updated slot
    await slot.save();

    // Return the updated leaderboard
    return NextResponse.json(
      { leaderboard: slot.leaderboard },
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

export async function GET(req) {
    try {
        dbConnect();
      const slots = await Slot.find({});
      return NextResponse.json({ slots }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
    }
  }
