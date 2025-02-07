import { NextResponse } from "next/server";
import { Slot } from "@/lib/schema.js";
import dbConnect from "@/lib/db.js";

export async function POST(req) {
  try {
    await dbConnect();
    const { startTime, endTime, players, password } = await req.json();

    // Create a new slot with a unique slotId
    const slot = await Slot.create({
      slotId: Date.now(),
      startTime,
      endTime,
      players,
      password,
    });

    return NextResponse.json(slot, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to create slot. Please try again." },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    await dbConnect();
    const { slotId, username, score } = await req.json();
    console.log(slotId, username, score);

    // Skip update if score is zero
    if (score === 0) {
      return NextResponse.json(
        { message: "Score is zero, skipping update" },
        { status: 200 }
      );
    }

    // Update score regardless of whether it's higher or lower
    const updateResult = await Slot.updateOne(
      { slotId, "leaderboard.username": username },
      {
        $set: { "leaderboard.$.score": score }, // Update score unconditionally
      }
    );

    if (updateResult.matchedCount === 0) {
      // Username not found, add a new entry
      await Slot.updateOne(
        { slotId },
        {
          $push: { leaderboard: { username, score } },
        }
      );
    }

    // Sort the leaderboard in descending order of score
    const updatedSlot = await Slot.findOneAndUpdate(
      { slotId },
      { $push: { leaderboard: { $each: [], $sort: { score: -1 } } } },
      { new: true }
    );

    if (!updatedSlot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    return NextResponse.json(
      { leaderboard: updatedSlot.leaderboard },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error updating leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to update leaderboard. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    const slots = await Slot.find({});
    console.log("Successfully fetched slots:", slots);
    return NextResponse.json({ slots }, { status: 200 });
  } catch (error) {
    console.error("Detailed error in GET /api/admin/slot:", error);
    return NextResponse.json({ 
      error: "Failed to fetch slots",
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET_SLOT(req, params) {
  try {
    await dbConnect();
    const { slotId } = params;
    const slot = await Slot.findOne({ slotId });
    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }
    return NextResponse.json({ slot }, { status: 200 });
  } catch (error) {
    console.error("Error fetching particular slot:", error);
    return NextResponse.json(
      { error: "Failed to fetch the slot. Please try again." },
      { status: 500 }
    );
  }
}
