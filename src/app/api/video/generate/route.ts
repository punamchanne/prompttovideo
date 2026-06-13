import { NextRequest, NextResponse } from "next/server";
import Video from "@/models/Video";
import Scene from "@/models/Scene";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import dbConfig from "@/config/db.config";
import { downloadAndStoreVideo } from "@/lib/videoStorage";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execPromise = promisify(exec);

dbConfig();

/* ---------------- Fal.ai Helper ---------------- */
async function generateVideoWithFal(
  prompt: string,
  videoId: string,
  sceneIndex: number,
  duration: number
): Promise<string> {
  const apiKey = process.env.FAL_API_KEY;
  if (!apiKey) {
    throw new Error("FAL_API_KEY is not defined in env variables");
  }

  // Log masked API key to confirm active key
  const maskedKey = apiKey.length > 8
    ? `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`
    : "invalid-key";
  console.log(`[Fal.ai Video Call] Using FAL_API_KEY: ${maskedKey}`);

  // 1️⃣ Submit request to queue
  const queueRes = await fetch("https://queue.fal.run/fal-ai/ltx-2.3/text-to-video", {
    method: "POST",
    headers: {
      "Authorization": `Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      prompt,
      duration: duration
    }),
  });

  if (!queueRes.ok) {
    const errText = await queueRes.text();
    throw new Error(`Fal.ai submission failed: ${queueRes.status} - ${errText}`);
  }

  const queueData = await queueRes.json();
  const statusUrl = queueData.status_url;
  const responseUrl = queueData.response_url;

  // 2️⃣ Poll for completion
  while (true) {
    await new Promise((r) => setTimeout(r, 2000));

    const statusRes = await fetch(statusUrl, {
      headers: {
        "Authorization": `Key ${apiKey}`,
      },
    });

    if (!statusRes.ok) {
      throw new Error(`Fal.ai status check failed: ${statusRes.status}`);
    }

    const statusData = await statusRes.json();

    if (statusData.status === "COMPLETED") {
      // Fetch the final result
      const resultRes = await fetch(responseUrl, {
        headers: {
          "Authorization": `Key ${apiKey}`,
        },
      });
      if (!resultRes.ok) {
        throw new Error(`Fal.ai result fetch failed: ${resultRes.status}`);
      }
      const resultData = await resultRes.json();
      const videoUrl = resultData.video?.url;

      if (!videoUrl) {
        throw new Error("Fal.ai completed but no video URL returned");
      }

      const fileName = `video-${videoId}-scene-${sceneIndex}.mp4`;
      const permanentUrl = await downloadAndStoreVideo(videoUrl, fileName);

      return permanentUrl;
    } else if (statusData.status === "FAILED") {
      throw new Error(`Fal.ai generation failed: ${JSON.stringify(statusData.error)}`);
    }
  }
}

/* ---------------- Pexels Fallback Helper ---------------- */
async function generateVideoWithPexels(
  prompt: string,
  videoId: string,
  sceneIndex: number
): Promise<string> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    throw new Error("PEXELS_API_KEY is not defined in env variables");
  }

  // Clean up the prompt to extract the actual subject for Pexels search
  let cleanedQuery = prompt.toLowerCase();
  
  const prefixes = [
    /^generate a video of\s+/,
    /^generate a video showing\s+/,
    /^generate a video\s+/,
    /^generate\s+/,
    /^create a video of\s+/,
    /^create a video showing\s+/,
    /^create a video\s+/,
    /^create\s+/,
    /^video of\s+/,
    /^video showing\s+/,
    /^show a video of\s+/,
    /^show a video showing\s+/,
    /^show\s+/,
    /^a video of\s+/,
    /^a video showing\s+/
  ];

  for (const prefix of prefixes) {
    cleanedQuery = cleanedQuery.replace(prefix, "");
  }

  // Remove common filler words
  cleanedQuery = cleanedQuery.replace(/\b(a|an|the|of|for|with|showing|in|on|at|some|any|to|and|or)\b/g, "");

  // Clean special characters and keep first 5 words
  cleanedQuery = cleanedQuery.replace(/[^a-zA-Z0-9 ]/g, "").trim();
  const words = cleanedQuery.split(/\s+/).filter(Boolean);
  const query = words.slice(0, 5).join(" ") || "education";

  console.log(`[Pexels Fallback] Cleaned query for Pexels: "${query}" (Original: "${prompt}")`);

  const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=5`;

  const res = await fetch(url, {
    headers: {
      "Authorization": apiKey,
    },
  });

  if (!res.ok) {
    throw new Error(`Pexels fallback failed: ${res.status} - ${await res.text()}`);
  }

  const data = await res.json();
  const video = data.videos?.[0];
  if (!video) {
    throw new Error(`No videos found on Pexels for query: "${query}"`);
  }

  // Find the highest quality/best MP4 file link
  const videoFile = video.video_files?.find((f: any) => f.file_type === "video/mp4") || video.video_files?.[0];
  if (!videoFile || !videoFile.link) {
    throw new Error("No valid video file link found on Pexels response");
  }

  const fileName = `video-${videoId}-scene-${sceneIndex}.mp4`;
  const permanentUrl = await downloadAndStoreVideo(videoFile.link, fileName);

  return permanentUrl;
}

/* ---------------- Local Offline Helper ---------------- */
async function generateVideoLocally(
  prompt: string,
  videoId: string,
  sceneIndex: number
): Promise<string> {
  const fileName = `video-${videoId}-scene-${sceneIndex}.mp4`;
  const videosDir = path.join(process.cwd(), "public", "videos");

  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }

  const outputPath = path.join(videosDir, fileName);
  const scriptPath = path.join(process.cwd(), "src", "lib", "localGenerator.py");

  console.log(`[Local Generator] Running: python "${scriptPath}" "${prompt}" "${outputPath}"`);

  try {
    // Escape double quotes to prevent command shell injection
    const safePrompt = prompt.replace(/"/g, '\\"');
    await execPromise(`python "${scriptPath}" "${safePrompt}" "${outputPath}"`);
    console.log(`[Local Generator] Successfully generated local video: ${fileName}`);
    return `/videos/${fileName}`;
  } catch (error: any) {
    console.error("[Local Generator] Error executing local python script:", error);
    throw new Error(`Local offline generation failed: ${error.message}`);
  }
}

/* ---------------- API ---------------- */
export async function POST(req: NextRequest) {
  let creditsReserved = false;
  let userId = "";
  try {
    /* ---------------- Auth ---------------- */
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET!) as any;
    userId = decodedData.id;

    /* ---------------- Input ---------------- */
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }

    /* ---------------- Credit Check ---------------- */
    const user = await User.findOneAndUpdate(
      { _id: userId, credits: { $gte: 5 } },
      { $inc: { credits: -5 } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: "Credit limit reached" },
        { status: 403 }
      );
    }

    creditsReserved = true;

    /* ---------------- Create Video ---------------- */
    const video = await Video.create({
      userId,
      title: prompt.slice(0, 50),
      originalPrompt: prompt,
      status: "GENERATING",
    });

    /* ---------------- Scene Definitions ---------------- */
    const sceneInputs = [
      {
        prompt: prompt,
        duration: 10,
        index: 0,
      },
    ];

    /* ---------------- Create Scene Docs ---------------- */
    const sceneDocs = await Scene.insertMany(
      sceneInputs.map((scene) => ({
        videoId: video._id,
        sceneIndex: scene.index,
        prompt: scene.prompt,
        duration: scene.duration,
        status: "GENERATING",
      }))
    );

    /* ---------------- Parallel Video Generation ---------------- */
    const videoUrls = await Promise.all(
      sceneInputs.map(async (scene) => {
        try {
          // 1. Try generating with Fal.ai
          return await generateVideoWithFal(scene.prompt, video._id.toString(), scene.index, scene.duration);
        } catch (aiError: any) {
          console.error(`Fal.ai failed for scene ${scene.index}:`, aiError.message || aiError);
          console.log(`Falling back to local offline generation for scene ${scene.index}...`);
          try {
            // 2. Fallback directly to local offline generator using MoviePy & Pillow
            return await generateVideoLocally(scene.prompt, video._id.toString(), scene.index);
          } catch (localError: any) {
            console.error(`Local offline generation failed for scene ${scene.index}:`, localError.message || localError);
            throw new Error(`Both Fal.ai and Local offline generation failed: ${aiError.message} | ${localError.message}`);
          }
        }
      })
    );

    /* ---------------- Update Scenes ---------------- */
    const generatedScenes = [];

    for (let i = 0; i < sceneDocs.length; i++) {
      sceneDocs[i].videoUrl = videoUrls[i];
      sceneDocs[i].status = "COMPLETED";
      await sceneDocs[i].save();

      generatedScenes.push({
        id: sceneDocs[i].sceneIndex + 1,
        duration: sceneDocs[i].duration,
        videoUrl: sceneDocs[i].videoUrl,
      });
    }

    /* ---------------- Finalize Video ---------------- */
    await Video.findByIdAndUpdate(video._id, {
      status: "COMPLETED",
      totalScenes: 1,
      totalDuration: 10,
      videoUrls,
    });

    /* ---------------- Finalize User Usage ---------------- */
    await User.findByIdAndUpdate(userId, {
      $inc: {
        totalVideosGenerated: 1,
      },
    });

    /* ---------------- Response ---------------- */
    return NextResponse.json({
      videoId: video._id,
      status: "COMPLETED",
      scenes: generatedScenes,
      remainingCredits: user.credits ?? 0,
    });
  } catch (error) {
    console.error("Error generating video:", error);

    try {
      // Refund credits if the generation failed after we reserved them.
      if (creditsReserved && userId) {
        await User.findByIdAndUpdate(userId, {
          $inc: { credits: 5 },
        });
      }
    } catch (refundError) {
      console.error("Error refunding credits:", refundError);
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
