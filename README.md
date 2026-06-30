# 🚀 CommunityHero
### AI-Powered Civic Issue Reporting & Resolution Platform using Google Gemini

<p align="center">
  <img src="assets/banner.png" alt="CommunityHero Banner" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Google-Gemini_API-blue?logo=google">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react">
  <img src="https://img.shields.io/badge/Node.js-Express-green?logo=node.js">
  <img src="https://img.shields.io/badge/PostgreSQL-Database-blue?logo=postgresql">
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript">
  <img src="https://img.shields.io/badge/License-MIT-yellow">
</p>

---

# 🌍 Overview

CommunityHero is an AI-powered civic issue reporting platform that enables citizens to report public infrastructure problems quickly using images, location, and natural language.

The platform leverages **Google Gemini Vision** and **Gemini Function Calling** to automatically analyze uploaded images, detect duplicate complaints, recommend responsible government departments, and provide an intelligent AI assistant for citizens.

Instead of simply collecting complaints, CommunityHero intelligently understands, verifies, prioritizes, and assists governments in resolving issues efficiently.

---

# 🎯 Problem Statement

Traditional civic complaint systems suffer from:

- Manual complaint submission
- Duplicate reports
- Poor issue categorization
- Lack of AI assistance
- Slow verification
- No intelligent prioritization
- Limited citizen engagement

CommunityHero solves these challenges using Google's Gemini AI.

---

# ✨ Key Features

## 📸 AI Image Analysis (Gemini Vision)

Upload an image.

Gemini automatically:

- Detects issue category
- Generates title
- Generates detailed description
- Estimates severity
- Assigns responsible department
- Calculates confidence score
- Suggests tags

---

## 🤖 CivicBot (Gemini Function Calling)

An intelligent AI assistant capable of:

- Finding nearby civic issues
- Searching issue history
- Explaining issue status
- Guiding citizens
- Finding responsible departments
- Answering civic-related questions

Unlike normal chatbots, CivicBot executes backend tools using **Gemini Function Calling**.

---

## 📍 Smart Issue Reporting

Users can:

- Upload photos
- Capture GPS location
- Auto-fill issue information
- Submit reports instantly

---

## 🔍 Duplicate Detection

CommunityHero combines:

- Geographic distance
- Text similarity
- AI-assisted comparison

to warn users before duplicate reports are submitted.

---

## 👥 Community Verification

Citizens verify existing reports.

Verified reports gain higher confidence and move faster through the resolution pipeline.

---

## 🏆 Gamification

Users earn:

- Points
- Badges
- Rankings
- Achievements

to encourage community participation.

---

## 📊 AI Admin Dashboard

Government officials receive:

- AI-generated summaries
- Department workload
- Issue trends
- Hotspot detection
- Resolution analytics
- Civic insights

---

# 🧠 Google Gemini Integration

## Gemini Vision

Used for:

- Image understanding
- Damage detection
- Category prediction
- Severity estimation
- Description generation

---

## Gemini Function Calling

CivicBot can call backend tools such as:

- Search Issues
- Nearby Issues
- Issue Details
- Department Recommendation

The model intelligently decides which backend tool to execute before responding.

---

## AI Insights

Gemini generates:

- Administrative summaries
- Civic trend reports
- Hotspot analysis
- Priority recommendations

---

# 🏗 Architecture

```text
                        Citizen

                           │

                           ▼

                React + TypeScript Frontend

                           │

                           ▼

               Express.js REST API Server

          ┌───────────────┼───────────────┐

          ▼               ▼               ▼

   PostgreSQL       Gemini Vision      Gemini Chat

     Database       Image Analysis   Function Calling

          │

          ▼

   Admin Dashboard + Analytics
```

---

# 🛠 Technology Stack

## Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Axios

---

## Backend

- Node.js
- Express.js
- TypeScript
- Multer
- JWT
- bcrypt

---

## Database

- PostgreSQL
- Drizzle ORM

---

## AI

- Google Gemini API
- Gemini Vision
- Gemini Function Calling

---

## Security

- Helmet
- CORS
- Rate Limiting
- Zod Validation

---

# 📂 Folder Structure

```text
CommunityHero/

├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   ├── drizzle/
│   ├── uploads/
│   └── package.json
│
├── shared/
│
├── docs/
│
└── README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/HareshSubramaniam/Solution_hero.git

cd Solution_hero
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment

Create:

```text
.env
```

```env
DATABASE_URL=your_database_url

JWT_SECRET=your_secret

GEMINI_API_KEY=your_google_gemini_api_key

PORT=3000
```

---

## Run Development Server

```bash
npm run dev
```

---

## Build

```bash
npm run build
```

---

# 📸 Screenshots

## Login

> Add Screenshot

---

## Dashboard

> Add Screenshot

---

## Report Issue

> Add Screenshot

---

## AI Vision Analysis

> Add Screenshot

---

## CivicBot

> Add Screenshot

---

## Leaderboard

> Add Screenshot

---

## Admin Dashboard

> Add Screenshot

---

# 🌟 Future Enhancements

- Mobile Application
- Voice Reporting
- Multilingual Support
- Predictive Maintenance
- GIS Heatmaps
- Push Notifications
- Smart City Integration

---

# 📈 Impact

CommunityHero helps:

- Citizens report issues faster
- Governments prioritize complaints
- Reduce duplicate reports
- Improve transparency
- Increase community engagement
- Accelerate issue resolution

---

# 👨‍💻 Team

**Haresh Subramaniam**

Full Stack Developer | AI Developer

---

# 📄 License

This project is licensed under the MIT License.

---

# ⭐ If you like this project

Please consider giving it a **Star ⭐** on GitHub.

---

## Built with ❤️ using Google Gemini AI
