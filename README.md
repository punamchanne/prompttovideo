# Vidary - Prompt-to-Video Generation Platform

Vidary is a modern, full-stack Next.js web application designed to generate educational and creative videos from simple text prompts. It is built to be resilient, utilizing multiple remote AI providers and a local offline Python generator as fallback options.

---

## 🚀 Key Features

* **Multi-Tier Video Generation:**
  * **Primary:** Generates high-quality AI videos using **Fal.ai API**.
  * **Fallback 1 (Pexels):** Fetches context-relevant stock video clips using **Pexels API** if the primary AI service is unavailable.
  * **Fallback 2 (Offline Generator):** Runs a local **Python pipeline** (using `moviepy`, `gTTS`, and `Pillow`) to generate educational slides, bouncing letter capsules, and audio voiceovers dynamically.
* **Full-Stack User Management:**
  * JWT-based secure user authentication (Registration, Login, Verification Emails).
  * Interactive user dashboard tracking video histories, creation times, and usage credits.
  * User profile management (supporting profile image uploads).
* **Responsive Modern UI:**
  * Built using **React 19**, **Next.js 16 (App Router)**, and **TypeScript**.
  * Premium design using **Tailwind CSS v4**, **DaisyUI v5**, and smooth animations powered by **Framer Motion**.
* **Database & Mail Services:**
  * Backed by **MongoDB** (using Mongoose) for managing users, credits, and video logs.
  * **Nodemailer** integration with **EJS templating** for verification emails.

---

## 🛠️ Technology Stack

* **Frontend & Backend API:** Next.js 16, React 19, TypeScript
* **Database:** MongoDB (via Mongoose)
* **Styling & UI:** Tailwind CSS v4, DaisyUI v5, Tabler Icons, Framer Motion, Recharts
* **Mail System:** Nodemailer, EJS
* **Local Offline Video Generation:** Python 3, MoviePy, Pillow (PIL), gTTS (Google Text-to-Speech), NumPy

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:

1. **Node.js** (v18.x or higher) and **npm**
2. **MongoDB** (Local instance running or MongoDB Atlas connection string)
3. **Python 3.x** (Required for the offline/fallback video generation pipeline)

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory and configure the following environment variables:

```env
# Database Connection
MONGO_URI=mongodb://localhost:27017/vidary

# Server Base URL
BASE_URL=http://localhost:3000

# Authentication Secret
JWT_SECRET=your_jwt_secret_here

# Third-Party APIs (Keys required for remote video generation)
FAL_API_KEY=your_fal_api_key_here
PEXELS_API_KEY=your_pexels_api_key_here

# SMTP Configuration (For email verification)
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

---

## 📦 Installation Guide

### 1. Clone the repository
```bash
git clone https://github.com/punamchanne/prompttovideo.git
cd prompttovideo
```

### 2. Install Node.js Dependencies
```bash
npm install
```

### 3. Install Python Dependencies (for Offline Generation)
The local offline video generation script depends on python packages. Install them using `pip`:
```bash
pip install pillow moviepy gTTS numpy
```
*Note: Make sure your system has the standard system fonts installed or accessible (the Python script automatically checks for standard Windows fonts like `Arial` and `Comic Sans`).*

---

## 💻 Running the Application

### Development Server
Start the development server with Webpack support enabled:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Production Build
Build and run the production-optimized client-server package:
```bash
npm run build
npm start
```

---

## 📁 Repository Structure

```
├── public/                     # Static assets (images, profile pictures)
│   └── videos/                 # Local directory for generated video outputs
├── src/
│   ├── app/                    # Next.js App Router (pages and API endpoints)
│   │   ├── (Home)/             # Public authentication & landing routes
│   │   ├── api/                # API routes (Auth, Video generation, Users)
│   │   └── user/               # User panel (dashboard, video creations, settings)
│   ├── components/             # Reusable UI components (Footer, Loading, Navbar, etc.)
│   ├── config/                 # Configurations (MongoDB, Nodemailer config)
│   ├── context/                # React Context for Application Authentication
│   ├── helper/                 # Helper utilities (Formatters, EJS mail templates)
│   ├── lib/                    # Library functions (Veo integration, Local python execution runner)
│   └── models/                 # Mongoose Database Models (User, Video, Scene)
├── tsconfig.json               # TypeScript Configuration
├── tailwind.config.ts          # Tailwind configuration
└── package.json                # Project dependencies and script scripts
```

---

## 🔒 Security & Safe Committing
* The `.env` file is excluded from git commits to protect sensitive database URLs and API keys.
* Temporary tests, logs, and generated videos in `/scratch/` and `/public/videos/` are automatically ignored.
