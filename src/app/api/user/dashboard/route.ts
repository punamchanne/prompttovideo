import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Video from "@/models/Video";
import Scene from "@/models/Scene";
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

    const videos = await Video.find({ userId }).lean();
    const totalVideos = videos.length;

    const totalDuration = videos.reduce(
      (sum, v) => sum + (v.totalDuration || 0),
      0
    );

    const totalScenes = videos.reduce(
      (sum, v) => sum + (v.totalScenes || 0),
      0
    );

    const activeGenerations = videos.filter(
      (v) => v.status === "GENERATING"
    ).length;

    const avgDuration = totalVideos > 0 ? totalDuration / totalVideos : 0;

    const recentVideos = videos.slice(0, 5).map((v) => ({
      title: v.title,
      duration: v.totalDuration,
      scenes: v.totalScenes,
      status: v.status,
    }));

    // TEMP usage trend (replace later with real credits log)
    const usageTrend = [
      { date: "Jan 01", credits: 2 },
      { date: "Jan 05", credits: 4 },
      { date: "Jan 10", credits: 6 },
      { date: "Jan 15", credits: 4 },
      { date: "Jan 20", credits: 8 },
    ];

    return NextResponse.json({
      totalVideos,
      avgDuration: Number(avgDuration.toFixed(1)),
      totalScenes,
      activeGenerations,
      usageTrend,
      recentVideos,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
