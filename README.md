# AI-FX Image Selection & Persona Generator

This is a high-fidelity AI persona generation and image selection platform built with Next.js. It leverages **Google Genkit** and **Gemini** to generate, manage, and curate character variations and likeness models for cinematic production.

## 🚀 Features

- **High-Fidelity Actor Likeness**: Maintains consistent identity across multiple generated variations.
- **Multi-Angle & Composition Generation**: Generates personas from various angles (90°, 45°) and shots (half-body, full-body).
- **Intelligent Image Curation**: Dedicated UI for selecting and managing the best generated outcomes.
- **Automated Workflow Notifications**: Integrated email system to notify stakeholders upon selection completion.
- **Local Storage Integration**: Saves selected portraits to organized local directories for production use.

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **AI Orchestration**: [Google Genkit](https://firebase.google.com/docs/genkit)
- **Models**: [Gemini 3 Flash Preview](https://ai.google.dev/models/gemini)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)
- **Email**: [Nodemailer](https://nodemailer.com/)
- **Infrastructure**: [Firebase](https://firebase.google.com/) (Planned/App Hosting)

## ⚙️ Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 2. Environment Setup

Copy the sample environment file and fill in your credentials:

```bash
cp .env.sample .env
```

Key requirements in `.env`:
- `GEMINI_API_KEY`: Obtain from [Google AI Studio](https://aistudio.google.com/).
- `SMTP_*`: Configure for email notifications (e.g., Gmail App Passwords).

### 3. Installation

```bash
npm install
```

### 4. Running the Development Server

The project uses port **9002** by default for the web interface.

```bash
# Start Next.js (Port 9002)
npm run dev

# Start Genkit Developer UI (Parallel terminal)
npm run genkit:dev
```

- Web App: [http://localhost:9002](http://localhost:9002)
- Genkit UI: [http://localhost:4000](http://localhost:4000) (Default)

## 📁 Project Structure

- `src/app/`: Next.js App Router (Pages & API routes)
- `src/ai/`: Genkit flows, models, and AI logic
- `src/components/`: Reusable React components (Shadcn/UI based)
- `src/lib/`: Shared utilities and configurations
- `public/`: Static assets

## 📜 Available Scripts

- `npm run dev`: Start Next.js in development mode with Turbopack on port 9002.
- `npm run genkit:dev`: Start the Genkit development environment.
- `npm run build`: Create a production-ready build.
- `npm run start`: Start the production server.
- `npm run lint`: Run ESLint checks.
- `npm run typecheck`: Run TypeScript compiler checks.

## 📄 License

Private / Confidential.
