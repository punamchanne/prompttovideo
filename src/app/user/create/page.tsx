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
import toast from "react-hot-toast";

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

  // Voice recognition and language settings
  const [isListening, setIsListening] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState("en-US");
  const [autoTranslate, setAutoTranslate] = useState(true);

  /* ---------------- Handlers ---------------- */

  const handleTranslate = async (textToTranslate: string) => {
    if (!textToTranslate.trim()) return "";
    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(
          textToTranslate
        )}`
      );
      if (!res.ok) throw new Error("Translation failed");
      const data = await res.json();
      const translatedText = data[0].map((x: any) => x[0]).join("");
      return translatedText;
    } catch (error) {
      console.error("Translation error:", error);
      toast.error("Could not translate prompt. Using original text.");
      return textToTranslate;
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      // Toggle off if clicking while active (note: standard API doesn't support easy pause, so we stop it)
      toast.success("Voice recording stopped");
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = speechLanguage;

    recognition.onstart = () => {
      setIsListening(true);
      toast.success("Listening... Speak now!");
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      if (event.error !== "no-speech") {
        toast.error(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setPrompt((prev) => (prev ? prev + " " + transcript : transcript));
      toast.success("Voice prompt added!");
    };

    recognition.start();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      setIsGenerating(true);
      setSystemMessage("Processing prompt...");

      let finalPrompt = prompt;
      if (autoTranslate) {
        setSystemMessage("Translating prompt to English for optimal AI quality...");
        const translated = await handleTranslate(prompt);
        if (translated && translated.toLowerCase().trim() !== prompt.toLowerCase().trim()) {
          toast.success(`Translated: "${translated}"`);
          finalPrompt = translated;
        }
      }

      setSystemMessage("Generating video using AI...");

      const res = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt }),
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

        {/* Multi-language and SpeechRecognition Panel */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pb-3 border-b border-base-content/10">
          <div className="flex items-center gap-2">
            <select
              className="select select-bordered select-sm max-w-xs"
              value={speechLanguage}
              onChange={(e) => setSpeechLanguage(e.target.value)}
              disabled={isGenerating || isListening}
            >
              <option value="en-US">🇺🇸 English</option>
              <option value="mr-IN">🇮🇳 Marathi</option>
              <option value="hi-IN">🇮🇳 Hindi</option>
              <option value="es-ES">🇪🇸 Spanish</option>
              <option value="fr-FR">🇫🇷 French</option>
              <option value="de-DE">🇩🇪 German</option>
              <option value="zh-CN">🇨🇳 Chinese</option>
              <option value="ja-JP">🇯🇵 Japanese</option>
              <option value="pt-BR">🇧🇷 Portuguese</option>
              <option value="ar-SA">🇸🇦 Arabic</option>
            </select>

            <label className="label cursor-pointer gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-primary checkbox-sm"
                checked={autoTranslate}
                onChange={(e) => setAutoTranslate(e.target.checked)}
                disabled={isGenerating}
              />
              <span className="label-text text-xs font-semibold">Translate to English</span>
            </label>
          </div>

          <button
            onClick={startListening}
            disabled={isGenerating}
            className={`btn btn-sm ${
              isListening ? "btn-error animate-pulse" : "btn-outline btn-secondary"
            } flex items-center gap-1`}
          >
            {isListening ? (
              <>
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-white mr-1"></span>
                Listening...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                  />
                </svg>
                Voice Input
              </>
            )}
          </button>
        </div>

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
                  <video key={scene.videoUrl} className="w-full rounded-lg mt-3" src={scene.videoUrl} controls />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
