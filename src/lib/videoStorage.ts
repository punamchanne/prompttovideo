import fs from "fs";
import path from "path";

export async function downloadAndStoreVideo(
  videoUrl: string,
  fileName: string
): Promise<string> {
  const res = await fetch(videoUrl);

  if (!res.ok) {
    throw new Error("Failed to download video");
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
