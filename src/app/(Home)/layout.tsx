"use client";
import { Toaster } from "react-hot-toast";
import "../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import axios from "axios";

const Component = ({ children }: { children: React.ReactNode }) => {
  const { setUser } = useAuth();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/api/auth/verifytoken");
        if (response.data && response.data.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        console.error("Error verifying token on home layout mount:", err);
      }
    };
    fetchUser();
  }, [setUser]);

  return (
    <body className={`antialiased roboto-condensed`}>
      <Toaster />
      <Navbar />
      {children}
      <Footer />
    </body>
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Vidary — AI-Powered Informative Videos, Instantly</title>
        <meta
          name="description"
          content="Vidary is an AI-powered platform that transforms text prompts into short, informative videos using advanced video models. Generate, store, and manage AI videos through a clean, chat-based interface built for creators, educators, and professionals."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <AuthProvider>
        <Component>{children}</Component>
      </AuthProvider>
    </html>
  );
}
