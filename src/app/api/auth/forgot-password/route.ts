import dbConfig from "@/config/db.config";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import ejs from "ejs";
import fs from "fs";
import path from "path";

dbConfig();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  auth: {
    user: process.env.SMTP_EMAIL || "projectiot1406@gmail.com",
    pass: process.env.SMTP_PASSWORD || "xyxjtekycznhpxyo",
  },
});

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const emailLower = email.trim().toLowerCase();
    const user = await User.findOne({ email: emailLower });
    if (!user) {
      return NextResponse.json(
        { message: "No account with that email address exists." },
        { status: 404 }
      );
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { message: "JWT secret is not configured" },
        { status: 500 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Embed email, OTP, and current password hash in verification token
    const verificationToken = jwt.sign(
      { email: user.email, otp, userId: user._id, currentHash: user.password },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Render the template
    const templatePath = path.join(process.cwd(), "src/helper/forgotPasswordTemplate.ejs");
    const template = fs.readFileSync(templatePath, "utf-8");
    const htmlContent = ejs.render(template, { name: user.name, otp });

    const mailOptions = {
      from: `ViDARY <${process.env.SMTP_EMAIL || "projectiot1406@gmail.com"}>`,
      to: user.email,
      subject: "Your ViDARY Password Reset OTP",
      html: htmlContent,
    };

    // Send email
    await new Promise<void>((resolve, reject) => {
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Mail send error:", err);
          reject(err);
        } else {
          console.log("Password reset OTP email sent:", info.response);
          resolve();
        }
      });
    });

    const response = NextResponse.json(
      { message: "Password reset OTP has been sent to your email." },
      { status: 200 }
    );

    // Save verification details in an httpOnly cookie
    response.cookies.set("forgot-password-token", verificationToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60, // 15 mins
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
