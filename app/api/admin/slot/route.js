import { NextResponse } from "next/server";
import { Slot } from "@/lib/schema.js";
import dbConnect  from "@/lib/db.js";

export async function POST(req) {
  try {
    dbConnect();
    const { startTime, endTime, players, password } = await req.json();

    // Create a new slot with a unique slotId
    const slot = await Slot.create({
      slotId: Date.now(),
      startTime,
      endTime,
      players,
      password,
    });

    // Return the newly created slot as a success response
    return NextResponse.json(slot, { status: 201 });
  } catch (error) {
    // Handle errors and return a proper error message
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
    console.log(slotId);

    // Update score only if the new score is greater than the existing score
    const updateResult = await Slot.updateOne(
      { slotId, "leaderboard.username": username },
      {
        $max: { "leaderboard.$.score": score }, // Only update if the new score is higher
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
    dbConnect();
    const slots = await Slot.find({});
    return NextResponse.json({ slots }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
  }
}

export async function GET_SLOT(req, params) {
  try {
    dbConnect();
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
