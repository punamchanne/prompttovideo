import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, otp } = await req.json();

  if (!email || !otp) {
    return NextResponse.json(
      { message: "Email and OTP are required" },
      { status: 400 }
    );
  }

  const verificationToken = req.cookies.get("email-verification-token")?.value;

  if (!verificationToken || !process.env.JWT_SECRET) {
    return NextResponse.json(
      { message: "OTP session has expired. Please request a new code." },
      { status: 400 }
    );
  }

  try {
    const payload = jwt.verify(verificationToken, process.env.JWT_SECRET) as {
      email: string;
      name: string;
      otp: string;
    };

    if (payload.email !== email || payload.otp !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    const response = NextResponse.json(
      { message: "Email verified successfully", verified: true },
      { status: 200 }
    );

    response.cookies.set("email-verification-token", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/api/helper/verify-email",
      maxAge: 0,
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "OTP session has expired. Please request a new code." },
      { status: 400 }
    );
  }
}