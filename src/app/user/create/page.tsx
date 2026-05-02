"use client";

import { useState } from "react";
import {
  IconSend,
  IconVideo,
  IconLoader2,
  IconTrash,
} from "@tabler/icons-react";
import Title from "@/components/Title";
import { useAuth } from "@/context/AuthContext";

/* ---------------- Types ---------------- */
type SceneStatus = "idle" | "generating" | "completed";

interface GeneratedScene {
  id: number;
  duration: number;
  videoUrl?: string;
  status: SceneStatus;
}

/* ---------------- Page ---------------- */
export default function CreateVideoPage() {
  const { user, setUser } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [scenes, setScenes] = useState<GeneratedScene[]>([]);
  const [systemMessage, setSystemMessage] = useState<string | null>(null);

  /* ---------------- Handlers ---------------- */

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      setIsGenerating(true);
      setSystemMessage("Generating video using AI...");

      const res = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
          errorData?.error || "Failed to generate video. Please try again."
        );
      }

      const data = await res.json();

      // Map backend scenes → UI scenes
      setScenes(
        data.scenes.map((scene: any, index: number) => ({
          id: index + 1,
          duration: scene.duration,
          status: "completed",
          videoUrl: scene.videoUrl,
        }))
      );

      if (user && typeof data.remainingCredits === "number") {
        setUser({
          ...user,
          credits: data.remainingCredits,
        });
      }

      setSystemMessage("Video generated successfully 🎉");
    } catch (err) {
      console.error(err);
      setSystemMessage(
        err instanceof Error ? err.message : "Failed to generate video"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setPrompt("");
    setScenes([]);
    setSystemMessage(null);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6 mx-auto">
      <Title
        title="Create Video"
        subtitle="Turn your idea into an informative AI video"
      />

      {/* -------- Prompt Box -------- */}
      <div className="card bg-base-200 shadow-xl p-4">
        <textarea
          className="textarea textarea-bordered w-full min-h-30"
          placeholder="Explain photosynthesis in a simple and visual way..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isGenerating}
        />

        <div className="flex justify-between items-center mt-4">
          <span className="text-sm opacity-70">
            Recommended length: 1–2 sentences
          </span>

          <div className="flex gap-2">
            <button
              className="btn btn-ghost"
              onClick={handleClear}
              disabled={isGenerating}
            >
              <IconTrash size={18} />
              Clear
            </button>

            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <IconLoader2 className="animate-spin" size={18} />
              ) : (
                <IconSend size={18} />
              )}
              Generate
            </button>
          </div>
        </div>
      </div>

      {/* -------- System Message -------- */}
      {systemMessage && (
        <div
          className={`alert ${
            systemMessage.includes("successfully")
              ? "alert-success"
              : "alert-error"
          } shadow`}
        >
          <IconVideo />
          <span>{systemMessage}</span>
        </div>
      )}

      {/* -------- Generated Scenes -------- */}
      {scenes.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg uppercase text-primary text-center">
            Generated Scenes
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenes.map((scene) => (
              <div key={scene.id} className="card bg-base-300 shadow-md p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Scene {scene.id}</h4>
                    <p className="text-sm opacity-70">
                      Duration: ~{scene.duration}s
                    </p>
                  </div>

                  <span
                    className={`badge ${
                      scene.status === "completed"
                        ? "badge-success"
                        : "badge-warning"
                    }`}
                  >
                    {scene.status}
                  </span>
                </div>

                {scene.videoUrl && (
                  <video className="w-full rounded-lg mt-3" controls>
                    <source src={scene.videoUrl} type="video/mp4" />
                  </video>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
