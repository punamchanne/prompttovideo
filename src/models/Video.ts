import { Schema, model, models, Types } from "mongoose";

const VideoSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: { type: String, required: true },
    originalPrompt: { type: String, required: true },

    status: {
      type: String,
      enum: ["PLANNING", "GENERATING", "COMPLETED", "FAILED"],
      default: "PLANNING",
    },

    totalDuration: { type: Number },
    totalScenes: { type: Number },
    videoUrls: [{ type: String }],
  },
  { timestamps: true }
);

export default models.Video || model("Video", VideoSchema);
