import { Schema, model, models, Types } from "mongoose";

const SceneSchema = new Schema(
  {
    videoId: {
      type: Types.ObjectId,
      ref: "Video",
      required: true,
    },

    sceneIndex: { type: Number, required: true },

    prompt: { type: String, required: true },

    duration: { type: Number, required: true },

    status: {
      type: String,
      enum: ["PENDING", "GENERATING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },

    videoUrl: { type: String },
  },
  { timestamps: true }
);

export default models.Scene || model("Scene", SceneSchema);
