import { NextResponse } from "next/server";

import dbConnect from "@/lib/db.js";
import { Slot } from "@/lib/schema.js";

export async function GET(req, {params}) {
  try {
    await dbConnect();  // Connect to the database

    const  {id}  = await params;
    console.log(id)
    const slot = await Slot.findOne({ slotId:id });
    if (!slot) {
      return NextResponse.json({ error: "No rounds found for this slot" },{status:400});
    }
console.log(slot)
    return NextResponse.json(slot);
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Failed to fetch rounds" },{status:500});
  }
}
