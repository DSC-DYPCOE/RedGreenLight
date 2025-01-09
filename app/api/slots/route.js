import { NextResponse } from "next/server";
import { Slot } from "@/lib/schema.js";
import dbConnect  from "@/lib/db.js";

export async function GET(req) {
    try {
        dbConnect();
      const slots = await Slot.find({});
      return NextResponse.json({ slots }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
    }
  }
