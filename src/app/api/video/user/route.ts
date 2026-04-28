import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Video from "@/models/Video";
import dbConfig from "@/config/db.config";

dbConfig();

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.id;

    const videos = await Video.find({ userId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
