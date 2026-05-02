import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, index: true },
    password: { type: String },
    profileImage: { type: String },
    credits: { type: Number, default: 100 },
    totalVideosGenerated: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
