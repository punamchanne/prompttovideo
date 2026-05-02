"use client";

import Loading from "@/components/Loading";
import Title from "@/components/Title";
import {
  IconVideo,
  IconClock,
  IconLayersSubtract,
  IconTrash,
} from "@tabler/icons-react";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

/* ---------------- Types ---------------- */
interface Video {
  _id: string;
  title: string;
  originalPrompt: string;
  status: "GENERATING" | "COMPLETED" | "FAILED";
  totalDuration: number;
  totalScenes: number;
  videoUrls: string[];
  createdAt: string;
}

export default function MyVideosPage() {
  const [videoList, setVideoList] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const totalVideos = videoList.length;
  const totalDuration = videoList.reduce(
    (sum, v) => sum + (v.totalDuration || 0),
    0
  );

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/video/user");
      setVideoList(res.data);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!!!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    setLoading(true);
    try {
      await axios.delete(`/api/video/delete-video?videoId=${id}`);
      toast.success("Video deleted successfully");
      setVideoList((prev) => prev.filter((v) => v._id !== id));
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete video");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <Title
        title="My Videos"
        subtitle="All your AI-generated videos in one place"
      />

      {/* ---------- Stats ---------- */}
      <div className="stats w-full bg-base-300">
        <div className="stat">
          <div className="stat-figure text-primary">
            <IconVideo width={28} />
          </div>
          <div className="stat-title">Total Videos</div>
          <div className="stat-value text-primary">{totalVideos}</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-secondary">
            <IconClock width={28} />
          </div>
          <div className="stat-title">Total Duration</div>
          <div className="stat-value text-secondary">{totalDuration}s</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-accent">
            <IconLayersSubtract width={28} />
          </div>
          <div className="stat-title">Total Scenes</div>
          <div className="stat-value text-accent">
            {videoList.reduce((sum, v) => sum + v.totalScenes, 0).toString()}
          </div>
        </div>
      </div>

      {/* ---------- Video List ---------- */}
      <div className="grid grid-cols-1 gap-6">
        {videoList.length === 0 && !loading && (
          <div className="card bg-base-200 shadow-xl p-8 text-center">
            <IconVideo size={40} className="mx-auto opacity-50" />
            <h3 className="mt-4 text-lg font-semibold">
              No videos generated yet
            </h3>
            <p className="text-sm opacity-70 mt-1">
              Create your first AI video to see it here.
            </p>
          </div>
        )}

        {videoList.map((video) => (
          <div key={video._id} className="card bg-base-200 shadow-xl p-5">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold">{video.title}</h2>
                <p className="text-sm opacity-70 mt-1">
                  {video.originalPrompt}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`badge ${
                    video.status === "COMPLETED"
                      ? "badge-success"
                      : video.status === "FAILED"
                      ? "badge-error"
                      : "badge-warning"
                  }`}
                >
                  {video.status}
                </span>

                <button
                  onClick={() => handleDelete(video._id)}
                  className="btn btn-xs btn-error"
                >
                  <IconTrash size={16} />
                </button>
              </div>
            </div>

            {video.videoUrls?.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {video.videoUrls.map((url, index) => (
                  <video key={index} className="w-full rounded-lg" controls>
                    <source src={url} type="video/mp4" />
                  </video>
                ))}
              </div>
            )}

            <div className="mt-4 text-xs opacity-60 flex justify-between">
              <span>
                {video.totalScenes || 0} scenes • {video.totalDuration || 0}s
              </span>
              <span>
                Created on {new Date(video.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
