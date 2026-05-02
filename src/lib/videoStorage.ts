import fs from "fs";
import path from "path";

export async function downloadAndStoreVideo(
  veoUrl: string,
  fileName: string
): Promise<string> {
  const res = await fetch(veoUrl, {
    headers: {
      "x-goog-api-key": process.env.GEMINI_API_KEY!,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to download Veo video");
  }

  const buffer = Buffer.from(await res.arrayBuffer());

  const videosDir = path.join(process.cwd(), "public", "videos");

  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }

  const filePath = path.join(videosDir, fileName);

  fs.writeFileSync(filePath, buffer);

  return `/videos/${fileName}`;
}
