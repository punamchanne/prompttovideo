import dbConfig from "@/config/db.config";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

dbConfig();

export async function POST(req: NextRequest) {
  try {
    const { otp, password } = await req.json();
    if (!otp || !password) {
      return NextResponse.json(
        { message: "OTP and new password are required" },
        { status: 400 }
      );
    }

    const verificationCookie = req.cookies.get("forgot-password-token")?.value;
    if (!verificationCookie) {
      return NextResponse.json(
        { message: "Your OTP session has expired. Please request a new OTP." },
        { status: 400 }
      );
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { message: "JWT secret is not configured" },
        { status: 500 }
      );
    }

    let decoded: any;
    try {
      decoded = jwt.verify(verificationCookie, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { message: "Verification session has expired. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Verify OTP matches
    if (decoded.otp !== otp.trim()) {
      return NextResponse.json(
        { message: "Invalid OTP code. Please check and try again." },
        { status: 400 }
      );
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Verify token hasn't been used yet (checking if hash in token matches user's current password hash)
    if (user.password !== decoded.currentHash) {
      return NextResponse.json(
        { message: "This reset session is no longer valid. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Update password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    // Clear verification cookie
    const response = NextResponse.json(
      { message: "Your password has been successfully reset. Redirecting to login..." },
      { status: 200 }
    );
    response.cookies.delete("forgot-password-token");

    return response;
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
