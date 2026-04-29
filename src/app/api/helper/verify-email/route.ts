import verifyEmail from "@/config/verifyemail";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, name } = await req.json();
  if (!email || !name) {
    return NextResponse.json(
      { message: "Email and name are required" },
      { status: 400 }
    );
  }

  if (!process.env.JWT_SECRET) {
    return NextResponse.json(
      { message: "JWT secret is not configured" },
      { status: 500 }
    );
  }

  const token = Math.floor(100000 + Math.random() * 900000).toString();
  const response = await verifyEmail(email, token, name);
  if (response) {
    const verificationToken = jwt.sign(
      { email, name, otp: token },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    const nextResponse = NextResponse.json(
      { message: "OTP sent successfully", email },
      { status: 200 }
    );

    nextResponse.cookies.set("email-verification-token", verificationToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/api/helper/verify-email",
      maxAge: 10 * 60,
    });

    return nextResponse;
  } else {
    return NextResponse.json(
      { message: "Failed to send OTP email" },
      { status: 500 }
    );
  }
}
