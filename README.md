# 🚢 ShipHype

> **AI-Powered Release Marketing & Hosted Changelog Engine for Indie Hackers**  
> Turn GitHub PRs and Releases into high-converting launch hype in seconds.

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.3-black?logo=next.js)](https://nextjs.org/)
[![Turbopack](https://img.shields.io/badge/Turbopack-Ready-blue)](https://turbo.build/)
[![Google Gemini API](https://img.shields.io/badge/Google%20Gemini-Cascade%20Engine-4285F4?logo=google)](https://ai.google.dev/)
[![Tailwind CSS 4](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FNoneButACoder%2Fshiphype&env=GEMINI_API_KEY,NEXT_PUBLIC_APP_URL&envDescription=Configure%20your%20Gemini%20API%20key%20and%20production%20URL)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ✨ Features

- **⚡ Fast-Cascade AI Inference**: Powered by Google Gemini (`gemini-3.5-flash` → `gemini-3.6-flash` → `gemini-3.1-flash-lite`) with a 12s fail-fast timeout, reducing release generation latency from 59s to under 4.5s.
- **🔍 Hallucination-Proof Number Auditing**: Strict heuristic cross-check auditing all numerical claims and metrics in AI-generated copy against source PR diffs and descriptions.
- **🐦 3x High-Converting Tweet Drafts**:
  - 📖 **Story Style**: Narrative hook focusing on developer motivation and user pain points.
  - ⚡ **Bullet Style**: Direct, scannable list of new capabilities for busy users.
  - 🎯 **Short Hook**: Punchy, high-engagement 1-liner designed for maximum viral reach on X.
- **🎨 1200×630 OpenGraph Bento Visual Cards**:
  - Zero-latency server-side rendering (`/api/card`) with zero AI regeneration cost.
  - 3 Design Templates: **Bento Dark**, **Clean Minimal**, and **Terminal Hacker**.
  - 6 Brand Color Accents: Indigo, Cyan, Emerald, Amber, Rose, Purple.
  - Instant 1-click clipboard PNG copying (`Ctrl+V` ready to paste directly on X or Slack).
- **🌐 Hosted Public Changelog Timelines (`/p/[slug]`)**:
  - Dynamic OpenGraph and Twitter meta cards.
  - Standard RSS 2.0 XML Feed (`/p/[slug]/rss.xml`) compatible with Feedly, Inoreader, and RSS readers.
  - Interactive category filters (`Features`, `Improvements`, `Fixes`), keyword search, and version anchor sharing (`#v1.1.0`).
- **📬 Email Subscriber Growth & Broadcast Engine**:
  - Embedded email subscription widget on hosted changelog pages.
  - Responsive HTML email newsletter generator with embedded visual cards and project branding.
  - Broadcast release announcements to all active subscribers via Resend API or simulation mode.
- **🤖 GitHub Webhook Automation (`/api/webhook/github`)**:
  - Automated draft creation on `release: published`.
  - HMAC-SHA256 signature verification and delivery idempotency tracking.
  - 1-click in-app webhook simulation without requiring external tunnels like ngrok.
- **🐙 GitHub Account & Repository Sync**:
  - Fast Username connect mode (zero API key required for public repos) + GitHub Personal Access Token mode.
  - Horizontal repository picker drawer with 1-click PR selection and instant generation.
- **🎨 Custom Project Branding**:
  - Custom Logo (Image URL or quick Emoji picker), custom tagline, description, and accent theme colors.
  - Official website, GitHub repo, and X/Twitter handle links.
  - Custom Domain DNS instructions (`CNAME -> cname.shiphype.com`).
- **🚀 X (Twitter) Publishing Integration**:
  - High-fidelity live tweet card preview matching X's native UI.
  - Zero-config instant composer with automatic clipboard image copying.
  - X API v2 direct posting with media upload and audit logs.

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/shiphype.git
cd shiphype
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your **Google Gemini API Key**:

```env
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Tip:** Get a free Gemini API key at [Google AI Studio](https://aistudio.google.com/app/apikey).

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Project Structure

```
shiphype/
├── data/                       # Local file-based JSON database (projects, releases, subscribers, logs)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/           # GitHub session & account connect endpoints
│   │   │   ├── broadcast/      # Subscriber email broadcast endpoint
│   │   │   ├── card/           # 1200×630 Bento image generation endpoint
│   │   │   ├── generate/       # Gemini AI release pack orchestrator
│   │   │   ├── github/         # GitHub repository & pull request APIs
│   │   │   ├── projects/       # Project CRUD & branding endpoints
│   │   │   ├── publish/        # Release publishing endpoint
│   │   │   ├── releases/       # Releases listing & status management
│   │   │   ├── social/x/       # X (Twitter) API direct publishing
│   │   │   ├── subscribe/      # Public changelog email subscription
│   │   │   └── webhook/github/ # GitHub release webhook listener & simulator
│   │   ├── dashboard/          # Project dashboard, release management, and branding
│   │   ├── p/[slug]/           # Public hosted changelog timeline & RSS feed
│   │   └── page.tsx            # Main generator workspace & repo picker
│   ├── components/             # Reusable UI components & modals
│   ├── lib/                    # Storage, Gemini cascade, auth, mailer, twitter helpers
│   └── types/                  # TypeScript interface definitions
├── .env.example                # Template of all supported environment variables
├── Dockerfile                  # Production multi-stage Docker container build
└── next.config.ts              # Next.js 16 Turbopack configuration
```

---

## 🚢 Production Deployment

### Option A: Deploy to Vercel (Recommended)

1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com/new) and import your repository.
3. In **Environment Variables**, configure:
   - `GEMINI_API_KEY`: Your Gemini API key.
   - `NEXT_PUBLIC_APP_URL`: Your production domain (e.g. `https://shiphype.vercel.app`).
   - `RESEND_API_KEY` (Optional): For sending live subscriber broadcast emails.
   - `GITHUB_TOKEN` (Optional): For higher GitHub rate limits.
4. Click **Deploy**. Vercel will build and launch your application globally on their edge network in ~60 seconds.

> **Serverless Persistence Note:** On Vercel, the application automatically mounts writable storage under `/tmp/shiphype-data` and pre-seeds it from `data/`, ensuring zero `EROFS` crashes.

---

### Option B: Deploy with Docker / Self-Hosted (Railway, Render, Fly.io, VPS)

ShipHype includes an optimized multi-stage `Dockerfile`:

```bash
# Build the Docker image
docker build -t shiphype:latest .

# Run the container
docker run -d -p 3000:3000 \
  -e GEMINI_API_KEY="your_api_key" \
  -e NEXT_PUBLIC_APP_URL="https://yourdomain.com" \
  --name shiphype shiphype:latest
```

---

## 🔒 Security & Privacy

- **Low-Sensitivity Ingestion**: ShipHype reads only PR titles, body descriptions, and changed file paths. Raw sensitive code diffs are kept strictly private by default.
- **Zero-Storage Auth**: GitHub Personal Access Tokens and X credentials can be saved directly in the user's browser localStorage without transmitting credentials to any third-party database.
- **HMAC Signature Verification**: All inbound GitHub webhooks are verified with SHA-256 HMAC signatures to prevent spoofing.

---

## 📄 License

MIT License © 2026 ShipHype. Built for indie builders who build in public.
