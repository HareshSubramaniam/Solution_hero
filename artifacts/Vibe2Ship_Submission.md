# Vibe2Ship Hackathon Submission Document

**Project Name:** CommunityHero
**Track/Technology:** Google AI Studio / Gemini API

---

### 1. Problem Statement Selected
**Civic Issue Management and Triage**
Cities struggle to manage the massive influx of civic issue reports from citizens. Reports are often duplicated, lack sufficient details, or are routed to the wrong department. This leads to slow resolution times, frustrated citizens, and wasted administrative resources.

### 2. Solution Overview
CommunityHero is an AI-powered platform that transforms how civic issues are reported and managed. Instead of forcing users to fill out complex forms, citizens simply upload a photo or chat with our AI agent (CivicBot). Gemini AI automatically analyzes the issue, categorizes it, estimates severity, checks for duplicates, and assigns it to the correct department.

### 3. Key Features
*   **Gemini Vision Auto-Triage**: Upload a photo, and the AI extracts the issue category, severity, priority, and department automatically.
*   **Agentic CivicBot (Function Calling)**: A conversational agent that can autonomously search for existing issues or create new reports by calling backend tools directly.
*   **AI Duplicate Detection**: Contextual matching of new reports against nearby existing issues to prevent database clutter.
*   **Smart Admin Dashboard**: Generates daily structured insights, identifying trends, priorities, and resource allocation recommendations for city planners.
*   **Community Gamification**: Citizens earn points for reporting and verifying issues, appearing on a community leaderboard.

### 4. Technologies Used
*   Frontend: React, Tailwind CSS, shadcn/ui, Leaflet (Maps)
*   Backend: Node.js, Express, Drizzle ORM
*   Database: PostgreSQL
*   AI Model: Gemini 2.5 Flash

### 5. Google Technologies Used
*   **Google AI Studio**: Prompt engineering and model testing.
*   **Gemini API (@google/genai)**: The core AI engine.
    *   **Vision API**: Used to analyze images of civic issues and extract metadata.
    *   **Function Calling**: Used to empower the CivicBot agent to execute database operations (`create_issue`, `search_issues`, `check_status`).
    *   **JSON Structured Output**: Used to strictly format triage data and admin insights.

### 6. Agentic Workflow Demonstration
1.  **Input**: User types "There is a massive pothole outside the Central Station."
2.  **Reasoning**: CivicBot understands the user's intent to report an issue.
3.  **Tool Execution**: CivicBot calls the `create_issue` function with parsed arguments (Category: Pothole, Severity: Medium, Address: Central Station).
4.  **Database Write**: The backend executes the function, inserting a new record.
5.  **Feedback**: CivicBot responds, "I've successfully reported the pothole at Central Station for you!"

### 7. Future Scope
*   Integration with Google Maps Platform (Places API, Routes API) for optimized routing of city maintenance trucks based on AI triage priority.
*   Multilingual voice reporting using Gemini's audio capabilities.
