import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import fs from "fs/promises";
import path from "path";

import Video from "@/models/Video";
import Scene from "@/models/Scene";
import dbConfig from "@/config/db.config";

dbConfig();

export async function DELETE(req: NextRequest) {
  try {
    const videoId = req.nextUrl.searchParams.get("videoId");

    if (!videoId || !Types.ObjectId.isValid(videoId)) {
      return NextResponse.json(
        { message: "Invalid or missing videoId" },
        { status: 400 }
      );
    }
    const video = await Video.findById(videoId);

    if (!video) {
      return NextResponse.json({ message: "Video not found" }, { status: 404 });
    }
    if (video.videoUrls?.length > 0) {
      await Promise.all(
        video.videoUrls.map(async (url: string) => {
          try {
            const filePath = path.join(
              process.cwd(),
              "public",
              url.replace(/^\/+/, "")
            );

            await fs.unlink(filePath);
          } catch (err) {
            console.warn("File delete failed:", url);
          }
        })
      );
    }

    await Scene.deleteMany({ videoId });

    await Video.findByIdAndDelete(videoId);

    return NextResponse.json(
      { message: "Video deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Video delete error:", error);
    return NextResponse.json(
      { message: "Something went wrong while deleting the video" },
      { status: 500 }
    );
  }
}
