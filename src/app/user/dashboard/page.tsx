"use client";

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  IconVideo,
  IconClock,
  IconLayersSubtract,
  IconBolt,
  IconChartBar,
} from "@tabler/icons-react";
import Title from "@/components/Title";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";

/* ---------------- Types ---------------- */
interface VidaryDashboardData {
  totalVideos: number;
  avgDuration: number;
  totalScenes: number;
  activeGenerations: number;
  usageTrend: { date: string; credits: number }[];
  recentVideos: {
    title: string;
    duration: number;
    scenes: number;
    status: "COMPLETED" | "GENERATING";
  }[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<VidaryDashboardData | null>();

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/user/dashboard");
      setData(res.data);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!!!");
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
        title={`Welcome back, ${user?.name || "Creator"} 👋`}
        subtitle="Here’s what’s happening with your AI videos"
      />

      {/* ---------- Stats ---------- */}
      <div className="stats w-full bg-base-300">
        <div className="stat">
          <div className="stat-figure text-primary">
            <IconVideo width={28} />
          </div>
          <div className="stat-title">Total Videos</div>
          <div className="stat-value text-primary">{data?.totalVideos}</div>
          <div className="stat-desc">Generated so far</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-secondary">
            <IconClock width={28} />
          </div>
          <div className="stat-title">Avg Duration</div>
          <div className="stat-value text-secondary">{data?.avgDuration}s</div>
          <div className="stat-desc">Per video</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-accent">
            <IconLayersSubtract width={28} />
          </div>
          <div className="stat-title">Scenes Generated</div>
          <div className="stat-value text-accent">{data?.totalScenes}</div>
          <div className="stat-desc">Veo clips</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-warning">
            <IconBolt width={28} />
          </div>
          <div className="stat-title">Active Jobs</div>
          <div className="stat-value text-warning">
            {data?.activeGenerations}
          </div>
          <div className="stat-desc">Processing now</div>
        </div>
      </div>

      {/* ---------- Usage Chart ---------- */}
      <div className="card bg-base-300 shadow-xl p-4">
        <h2 className="text-lg font-semibold text-primary uppercase text-center mb-2">
          Monthly AI Usage
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data?.usageTrend}>
            <Line
              type="monotone"
              dataKey="credits"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ---------- Recent Videos ---------- */}
      <div className="card bg-base-200 shadow-xl p-4">
        <h2 className="text-lg font-semibold text-primary uppercase text-center mb-4">
          Recent Videos
        </h2>

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Duration</th>
                <th>Scenes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentVideos.map((video, i) => (
                <tr key={i}>
                  <th>{i + 1}</th>
                  <td className="font-medium">{video.title}</td>
                  <td>{video.duration}s</td>
                  <td>{video.scenes}</td>
                  <td>
                    <span
                      className={`badge ${
                        video.status === "COMPLETED"
                          ? "badge-success"
                          : "badge-warning"
                      }`}
                    >
                      {video.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
