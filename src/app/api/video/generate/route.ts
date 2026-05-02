import { NextRequest, NextResponse } from "next/server";
import Video from "@/models/Video";
import Scene from "@/models/Scene";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import dbConfig from "@/config/db.config";
import { downloadAndStoreVideo } from "@/lib/videoStorage";

dbConfig();

/* ---------------- Veo Helper ---------------- */
async function generateVideoWithVeo(
  prompt: string,
  videoId: string,
  sceneIndex: number
): Promise<string> {
  // 1️⃣ Start generation
  const startRes = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY!,
      },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          aspectRatio: "16:9",
          negativePrompt: "",
        },
      }),
    }
  );

  const startData = await startRes.json();
  const operationName = startData?.name;

  if (!operationName) {
    console.error("Veo Start Error:", JSON.stringify(startData, null, 2));
    throw new Error("Failed to start Veo generation");
  }

  // 2️⃣ Poll operation
  while (true) {
    await new Promise((r) => setTimeout(r, 2000));

    const pollRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${operationName}`,
      {
        headers: {
          "x-goog-api-key": process.env.GEMINI_API_KEY!,
        },
      }
    );

    const pollData = await pollRes.json();

    if (pollData.done) {
      const videoUrl =
        pollData.response?.generateVideoResponse?.generatedSamples?.[0]?.video
          ?.uri;

      if (!videoUrl) {
        throw new Error("Veo completed but no video URL returned");
      }

      const fileName = `video-${videoId}-scene-${sceneIndex}.mp4`;
      const permanentUrl = await downloadAndStoreVideo(videoUrl, fileName);

      return permanentUrl;
    }
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
        prompt: `${prompt}. Cinematic wide establishing visuals.`,
        duration: 8,
        index: 0,
      },
      {
        prompt: `${prompt}. Close-up details and visual explanation.`,
        duration: 8,
        index: 1,
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

    /* ---------------- Parallel Veo Calls ---------------- */
    const videoUrls = await Promise.all(
      sceneInputs.map((scene) =>
        generateVideoWithVeo(scene.prompt, video._id.toString(), scene.index)
      )
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
      totalScenes: 2,
      totalDuration: 16,
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
