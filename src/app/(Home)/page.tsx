"use client";

import { motion } from "framer-motion";
import {
  IconCalendarEvent,
  IconStethoscope,
  IconShieldLock,
  IconClock,
  IconUserCheck,
  IconDeviceMobile,
  IconMessage,
  IconMail,
} from "@tabler/icons-react";
export default function HomePage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  return (
    <>
      <header className="hero min-h-[80vh] bg-base-100 mt-20">
        <div className="hero-content text-center">
          <div className="max-w-3xl">
            <div className="badge badge-outline badge-secondary mb-4 p-4 gap-2">
              ✨ Powered by Gemini AI
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              Turn Ideas into{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">
                Informative Videos
              </span>{" "}
              with AI
            </h1>
            <p className="text-lg md:text-xl mb-10 opacity-80">
              Generate short, knowledge-rich videos from simple prompts using
              advanced AI. Built for educators, creators, and professionals.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button className="btn btn-primary btn-lg shadow-xl px-8">
                Get Started
              </button>
              <button className="btn btn-ghost btn-lg px-8 border-base-300">
                View Features
              </button>
            </div>
            <div className="mt-16 relative">
              <div className="mockup-window border border-base-300 bg-base-200 shadow-2xl">
                <div className="bg-base-100 flex justify-center items-center h-64 md:h-96">
                  <div className="flex flex-col items-center gap-4 opacity-40">
                    <div className="loading loading-ring loading-lg text-primary" />
                    <p className="font-mono text-sm">
                      Generating scenes from prompt...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <section id="features" className="py-24 bg-base-200/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features for Productivity
            </h2>
            <p className="max-w-2xl mx-auto opacity-70">
              Everything you need to create educational content in seconds
              rather than hours.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="card-body">
                <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-xl mb-4 text-2xl">
                  🪄
                </div>
                <h3 className="card-title text-xl mb-2">Text-to-Video AI</h3>
                <p className="opacity-70">
                  Transform complex text or simple prompts into high-quality
                  informative video content instantly.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="card-body">
                <div className="w-12 h-12 bg-secondary/10 text-secondary flex items-center justify-center rounded-xl mb-4 text-2xl">
                  💬
                </div>
                <h3 className="card-title text-xl mb-2">Chat Interface</h3>
                <p className="opacity-70">
                  Refine your videos using a natural chat-style prompt
                  interface. Just talk to your AI director.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="card-body">
                <div className="w-12 h-12 bg-accent/10 text-accent flex items-center justify-center rounded-xl mb-4 text-2xl">
                  🎞️
                </div>
                <h3 className="card-title text-xl mb-2">Scene Management</h3>
                <p className="opacity-70">
                  Generate content scene-by-scene for longer, structured videos
                  that keep viewers engaged.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="card-body">
                <div className="w-12 h-12 bg-info/10 text-info flex items-center justify-center rounded-xl mb-4 text-2xl">
                  🛡️
                </div>
                <h3 className="card-title text-xl mb-2">Secure Library</h3>
                <p className="opacity-70">
                  Manage your history and save videos to a private personal
                  library with secure authentication.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="card-body">
                <div className="w-12 h-12 bg-success/10 text-success flex items-center justify-center rounded-xl mb-4 text-2xl">
                  ⚡
                </div>
                <h3 className="card-title text-xl mb-2">Next-Gen Speed</h3>
                <p className="opacity-70">
                  A clean, lightning-fast UI built with Next.js for a
                  distraction-free creation process.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="card-body">
                <div className="w-12 h-12 bg-warning/10 text-warning flex items-center justify-center rounded-xl mb-4 text-2xl">
                  📂
                </div>
                <h3 className="card-title text-xl mb-2">Smart Export</h3>
                <p className="opacity-70">
                  Preview and download your videos in multiple formats ready for
                  sharing on any platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="how-it-works" className="py-24 bg-base-100">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Simple Workflow
          </h2>
          <div className="flex flex-col md:flex-row gap-12 items-center justify-center">
            <ul className="steps steps-vertical lg:steps-horizontal w-full">
              <li className="step step-primary" data-content={1}>
                <div className="mt-4 px-4">
                  <h4 className="font-bold">Enter Prompt</h4>
                  <p className="text-sm opacity-60">
                    Describe your topic in detail
                  </p>
                </div>
              </li>
              <li className="step step-primary" data-content={2}>
                <div className="mt-4 px-4">
                  <h4 className="font-bold">AI Generation</h4>
                  <p className="text-sm opacity-60">
                    Wait while Gemini creates scenes
                  </p>
                </div>
              </li>
              <li className="step step-primary" data-content={3}>
                <div className="mt-4 px-4">
                  <h4 className="font-bold">Preview &amp; Save</h4>
                  <p className="text-sm opacity-60">
                    Review the output and edit
                  </p>
                </div>
              </li>
              <li className="step step-primary" data-content={4}>
                <div className="mt-4 px-4">
                  <h4 className="font-bold">Dashboard Access</h4>
                  <p className="text-sm opacity-60">
                    Always available in your library
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
      <section id="tech" className="py-16 bg-neutral text-neutral-content">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm font-semibold tracking-widest uppercase mb-8 opacity-60">
            Built with Modern Architecture
          </p>
          <div className="flex flex-wrap justify-center gap-10 md:gap-20 opacity-80">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold">Gemini AI</span>
              <span className="text-xs">Video Models</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold">Next.js</span>
              <span className="text-xs">Frontend &amp; API</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold">MongoDB</span>
              <span className="text-xs">Database</span>
            </div>
          </div>
          <p className="mt-12 text-sm opacity-50">
            Enterprise-grade performance and scalability guaranteed.
          </p>
        </div>
      </section>
      <section id="contact" className="py-24 bg-base-100">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="bg-neutral text-neutral-content rounded-[3rem] p-10 lg:p-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 opacity-10">
              <IconMessage size={300} />
            </div>

            <div>
              <h2 className="text-4xl lg:text-5xl font-black mb-6">
                Let's Transform Your Learning.
              </h2>
              <p className="text-lg opacity-80 mb-10">
                Reach out to discuss how Vidary can elevate your educational
                content creation with AI-driven videos.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <IconMail className="text-primary" /> support@vidary.ai
                </div>
              </div>
            </div>

            <motion.div
              {...fadeIn}
              className="bg-base-100 p-8 rounded-3xl text-base-content shadow-inner"
            >
              <div className="grid grid-cols-1 gap-4">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend font-bold">
                    Email Address
                  </legend>
                  <input
                    type="email"
                    placeholder="you@email.com"
                    className="input input-bordered w-full"
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend font-bold">
                    Inquiry Details
                  </legend>
                  <textarea
                    placeholder="Your message here..."
                    className="textarea textarea-bordered w-full h-32"
                  />
                </fieldset>
                <button className="btn btn-primary w-full mt-4 text-white uppercase font-black">
                  Request Demo
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
