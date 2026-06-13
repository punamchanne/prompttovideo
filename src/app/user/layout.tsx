"use client";
import axios from "axios";
import "../globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import SideNav from "./SideNav";

const Component = ({ children }: { children: React.ReactNode }) => {
  const { setUser } = useAuth();
  useEffect(() => {
    const fetchUser = async () => {
      const response = await axios.get("/api/auth/verifytoken");
      if (response.data) {
        setUser(response.data.user);
      }
    };
    fetchUser();
  }, []);
  return (
    <html lang="en">
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
      <body className={`antialiased Orbitron`}>
        <div className="absolute top-0 left-0 right-0 z-50">
          <Toaster />
        </div>
        <SideNav className="roboto-condensed">{children}</SideNav>
      </body>
    </html>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <Component>{children}</Component>
    </AuthProvider>
  );
}
