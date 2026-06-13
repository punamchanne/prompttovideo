import dbConfig from "@/config/db.config";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

dbConfig();

export async function POST(req: NextRequest) {
  try {
    const { formData } = await req.json();
    if (!formData || !formData.email || !formData.password) {
      return NextResponse.json(
        { message: "Please fill all the fields" },
        { status: 400 }
      );
    }

    const emailLower = formData.email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email is already registered. Please login instead." },
        { status: 400 }
      );
    }

    const encryptedPassword = bcrypt.hash(formData.password, 10);
    const newUser = new User({
      ...formData,
      email: emailLower,
      password: await encryptedPassword,
    });
    await newUser.save();
    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    // Handle index race-condition or duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "Email is already registered. Please login instead." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
