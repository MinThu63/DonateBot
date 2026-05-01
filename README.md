# DonateBot 🤖💰

**A Smart Donation Kiosk that combines Fintech payment processing with Robotics simulation — watch a 3D robot dance when you donate!**

DonateBot is a full-stack web application that demonstrates how financial technology and robotics can work together to encourage charitable giving. Donors select a cause, choose an amount, and pay via PayPal. In response, a 3D-simulated service robot performs tiered dance routines — bigger donations unlock bigger moves. The concept is designed for deployment on physical robot kiosks in public spaces like malls, schools, and community centres.

---

## Table of Contents

- [Motivation](#motivation)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Technical Highlights](#technical-highlights)
- [Getting Started](#getting-started)
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)
- [License](#license)

---

## Motivation

Charitable donations often rely on passive collection boxes or impersonal online forms. Research shows that interactive, rewarding experiences significantly increase donor engagement and repeat giving.

DonateBot explores a different approach:

- **What if donating was fun?** A robot that dances in response to your generosity creates an emotional reward loop.
- **What if fintech met robotics?** Payment events (PayPal transactions) directly trigger robot behaviour through real-time WebSocket communication — a genuine integration of two disciplines.
- **What if kiosks were alive?** Instead of a static screen, a robot that waves, beckons, and speaks draws foot traffic in public spaces.

This project was built as a university application portfolio piece to demonstrate interdisciplinary thinking across **Information Technology (Fintech)** and **Robotics**, with a focus on **community impact**.

---

## Features

### Donation System
- **PayPal Sandbox Integration** — Full payment flow (create order → approve → capture) using PayPal's REST API with SGD currency
- **4 Charity Causes** — Education for All, Green Earth Fund, Community Health, Animal Shelter
- **Preset Donation Amounts** — S$2, S$5, S$10, S$20, S$50 quick-select buttons
- **Real-time Stats** — Fundraising goal progress, total raised, donor count, average donation, and per-charity breakdown

### 3D Robot Simulation
- **Realistic Service Robot** — Modelled after real-world robots (Pepper/Nao style) with rounded body, metallic materials, ball joints, chest display screen, LED eyes, ear sensors, and antenna
- **Tiered Dance System** — 4 donation tiers trigger different dance routines:
  | Tier | Amount | Dance Move |
  |------|--------|------------|
  | Small | < S$5 | Happy Nod — head bobs, arms clap |
  | Medium | S$5–S$20 | Robot Groove — torso twists, arms swing |
  | Large | S$20–S$50 | Cabbage Patch — arms circle, torso sways |
  | Epic | S$50+ | Full Celebration — combines all moves with base rotation |
- **Realistic Movement** — Upper body only (arms, head, torso). Feet stay planted. No jumping. Designed to be physically feasible for a real robot kiosk.
- **Idle Behaviour** — Robot waves at passersby, looks around, beckons with "come here" gestures, and shows rotating encouragement messages

### Audio & Voice
- **Sound Effects** — Procedurally generated musical jingles per tier using Web Audio API (no audio files)
- **Voice Synthesis** — Robot speaks thank-you messages aloud using the Web Speech API with a higher pitch for a robotic personality
- **Speech Bubbles** — 3D floating speech bubbles above the robot with fade-in/out animations
- **Mute Controls** — Independent toggles for sound effects and voice

### Real-time Communication
- **WebSocket Broadcasting** — Donations are broadcast to all connected clients in real time
- **Live Donation Ticker** — Scrolling news-style ticker at the bottom showing recent donations
- **Connection Status** — Live/Offline indicator in the header

### UI/UX
- **Kiosk-style Layout** — Robot viewport on the left, "chest screen" donation panel on the right (simulating a real robot's built-in display)
- **Screen Bezel Design** — The donation panel is styled as an embedded device screen with camera dot and label
- **Tabbed Interface** — Switch between Donate and Progress views
- **Confetti Particles** — 3D confetti system with particle count scaled to donation tier
- **Responsive Design** — Adapts to mobile and tablet screens

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Browser (Client)                    │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Donation Form│  │  3D Robot    │  │  Stats Panel  │  │
│  │ (PayPal SDK) │  │ (Three.js)  │  │  + Ticker     │  │
│  └──────┬───────┘  └──────▲───────┘  └───────▲───────┘  │
│         │                 │                   │          │
│         │ HTTP POST       │ WebSocket         │ HTTP GET │
└─────────┼─────────────────┼───────────────────┼──────────┘
          │                 │                   │
          ▼                 │                   │
┌─────────────────────────────────────────────────────────┐
│                    Server (Node.js)                       │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Express API  │  │  WebSocket   │  │  In-Memory DB │  │
│  │ /api/orders  │──│  Broadcast   │──│  Donations    │  │
│  └──────┬───────┘  └──────────────┘  └───────────────┘  │
│         │                                                │
└─────────┼────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────┐
│   PayPal Sandbox    │
│   REST API (SGD)    │
│   - Create Order    │
│   - Capture Payment │
│   - Refund          │
└─────────────────────┘
```

**Flow:**
1. Donor selects charity and amount on the kiosk screen
2. Client calls `POST /api/orders` → Server creates PayPal order
3. Donor approves payment in PayPal popup
4. Client calls `POST /api/orders/:id/capture` → Server captures payment
5. Server saves donation and broadcasts via WebSocket
6. All connected clients receive the event → Robot dances, confetti falls, sound plays, voice speaks

---

## Project Structure

```
DonateBot/
├── server/                          # Backend
│   ├── index.js                     # Express server + WebSocket + API routes
│   ├── paypal.js                    # PayPal REST API (auth, create, capture, refund)
│   ├── db.js                        # In-memory donation store + stats
│   ├── .env                         # PayPal sandbox credentials (not committed)
│   ├── .gitignore
│   └── package.json
│
├── client/                          # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx                  # Main app — layout, PayPal provider, state
│   │   ├── App.css                  # Full kiosk UI styles (dark theme)
│   │   ├── index.css                # Global styles
│   │   ├── main.jsx                 # React entry point
│   │   │
│   │   ├── components/
│   │   │   ├── Robot.jsx            # 3D robot model + dance animations + idle behaviour
│   │   │   ├── RobotScene.jsx       # Three.js canvas, lighting, stage, speech bubbles
│   │   │   ├── Confetti.jsx         # 3D confetti particle system
│   │   │   ├── SpeechBubble.jsx     # Floating 3D speech bubble with fade
│   │   │   ├── DonationForm.jsx     # Charity picker, amount buttons, PayPal buttons
│   │   │   ├── StatsPanel.jsx       # Goal progress, stats cards, charity breakdown
│   │   │   └── DonationTicker.jsx   # Scrolling live donation ticker
│   │   │
│   │   └── hooks/
│   │       ├── useWebSocket.js      # WebSocket connection + message handling
│   │       ├── useSoundEffects.js   # Web Audio API procedural sound generation
│   │       └── useRobotVoice.js     # Web Speech API voice synthesis + messages
│   │
│   ├── index.html
│   ├── vite.config.js               # Vite config with API proxy
│   └── package.json
│
└── README.md
```

---

## Technical Highlights

| Area | Technology | Why |
|------|-----------|-----|
| **3D Rendering** | Three.js + React Three Fiber + Drei | Industry-standard WebGL library with React bindings for declarative 3D scenes |
| **Payment Processing** | PayPal REST API v2 (Sandbox) | Real payment flow with OAuth2 authentication, order creation, and capture |
| **Real-time Events** | WebSocket (ws) | Low-latency bidirectional communication for instant robot reactions |
| **Sound Effects** | Web Audio API | Procedurally generated — no audio files needed, works everywhere |
| **Voice Synthesis** | Web Speech API | Browser-native text-to-speech with adjustable pitch for robotic personality |
| **Robot Behaviour** | Finite State Machine | Idle → Dance (4 tiers) → Idle. Each tier has distinct animation parameters |
| **Animation System** | useFrame (per-frame updates) | 60fps smooth animations with time-based interpolation |
| **Frontend** | React 19 + Vite | Fast HMR development, modern JSX |
| **Backend** | Express 5 + Node.js | Lightweight API server with CORS and JSON parsing |
| **Currency** | SGD (Singapore Dollar) | Configured for Singapore-based deployment |

**Key Engineering Decisions:**
- **Upper-body-only dance moves** — Realistic for a fixed-base robot kiosk. No jumping or leg movement.
- **In-memory database** — Sufficient for demo/prototype. Production would use SQLite or PostgreSQL.
- **Procedural audio** — Eliminates dependency on audio files and licensing concerns.
- **WebSocket over polling** — Instant reaction when a donation lands, critical for the dance trigger.
- **3D simulation over physical hardware** — Validates the full software stack. Physical deployment is the next step.

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **PayPal Sandbox Account** — [Create one here](https://developer.paypal.com/dashboard/)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/donatebot.git
cd donatebot
```

### 2. Set up the server

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret
PAYPAL_ENVIRONMENT=SANDBOX
PAYPAL_API=https://api-m.sandbox.paypal.com
PORT=3001
```

### 3. Set up the client

```bash
cd ../client
npm install
```

Update the `PAYPAL_CLIENT_ID` in `client/src/App.jsx` with your sandbox client ID.

### 4. Run the application

**Terminal 1 — Start the server:**
```bash
cd server
npm start
```

**Terminal 2 — Start the client:**
```bash
cd client
npm run dev
```

### 5. Open in browser

Navigate to `http://localhost:5173` (or the port Vite assigns).

Use [PayPal Sandbox test accounts](https://developer.paypal.com/dashboard/accounts) to make test donations.

---

## Screenshots + Demo Video

<img width="1024" height="559" alt="image" src="https://github.com/user-attachments/assets/776b448e-fea2-4b61-bd1c-afeb463d7302" />


---

## Roadmap

- [ ] **Physical Hardware** — Deploy to Raspberry Pi with servo motors for a real robot kiosk
- [ ] **Persistent Database** — SQLite or PostgreSQL for production donation records
- [ ] **QR Code Donations** — Generate QR codes for mobile payment scanning
- [ ] **Multi-language Support** — English, Mandarin, Malay, Tamil (Singapore's official languages)
- [ ] **Admin Dashboard** — Charts, trends, export data, manage charities
- [ ] **Donation Receipts** — Shareable social media cards after donating
- [ ] **Face Tracking** — Robot turns to look at the nearest person via webcam
- [ ] **Stripe Integration** — Alternative payment provider alongside PayPal
- [ ] **Leaderboard** — Top donors with gamification elements

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<p align="center">
  <b>DonateBot</b> — Where Fintech meets Robotics for good 🤖💖
</p>
