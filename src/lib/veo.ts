export async function generateVideoWithVeo(prompt: string) {
  const startRes = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY!,
      },
      body: JSON.stringify({
        instances: [{ prompt: buildPromptToGenerateVideo(prompt) }],
        parameters: {
          aspectRatio: "16:9",
          negativePrompt: "",
        },
      }),
    }
  );

  const startData = await startRes.json();
  const operationName = startData.name;

  if (!operationName) {
    throw new Error("Failed to start Veo generation");
  }

  // 2️⃣ Poll until done
  let done = false;
  let videoUrl = "";

  while (!done) {
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
      done = true;
      videoUrl =
        pollData.response?.generateVideoResponse?.generatedSamples?.[0]?.video
          ?.uri;
    }
  }

  if (!videoUrl) {
    throw new Error("Veo did not return video URL");
  }

  return videoUrl;
}

const buildPromptToGenerateVideo = (userPrompt: string) => `
You are an AI video planner.

Task: Take the user's prompt and make the ai video.

Topic:
"${userPrompt}"
`;
