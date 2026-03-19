# AI-FX Image Selection & Persona Generator

![License: Confidential](https://img.shields.io/badge/License-Confidential-red.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?logo=react)
![Google Genkit](https://img.shields.io/badge/Google_Genkit-1.28-orange)

An industrial-grade, high-fidelity AI persona generation and image selection platform. Designed for cinematic production, this application leverages **Google Genkit** and the **Gemini 3 Flash Preview** models via **Vertex AI** to generate, curate, and manage character likeness variations at an unparalleled level of consistency.

## 🚀 Key Features

### AI Image Generation & Processing
- **High-Fidelity Likeness Preservation**: Maintains character identity consistency across varied generations, angles, and styles.
- **Multi-Category Generation**: Specifically orchestrated to generate categorized shots: *Portraits*, *Half-Body*, and *Full-Body* compositions.
- **Parallelized API Architecture**: Optimized Genkit flows that execute parallel requests to Google GenAI and VertexAI for drastically reduced generation times.
- **Dynamic Upscaling**: Enhanced image resolution and processing capabilities directly integrated.

### Intelligent Image Curation Workflow
- **Quota Enforcements**: Enforces minimum selection requirements for production sets (e.g., 22 Portraits, 6 Half-Body, and 2 Full-Body images).
- **Real-Time Tracking & UI Counters**: Floating panels and dynamic states immediately reflect generation and selection progress.
- **Variation Refinement**: On-demand "Generate variations" capabilities to guide the AI from subtle variations to drastic lighting/compositional shifts.
- **Local Asset Management**: Seamlessly saves curated production portraits to local directories (`/saved_portraits`) for immediate downstream use.

### Automated Notifications
- **SMTP Integration**: Automatically dispatched email notifications using `nodemailer` when production quotas are met and curation is finalized.

---

## 🏗 System Architecture & Tech Stack

This project is built using modern, production-ready web and AI technologies.

### Core Frameworks
- **Frontend / Fullstack**: [Next.js 15.5.9](https://nextjs.org/) (App Router, Turbopack enabled)
- **UI Library**: [React 19](https://react.dev/)
- **Core AI Orchestration**: [Google Genkit](https://firebase.google.com/docs/genkit) (`@genkit-ai/google-genai`, `@genkit-ai/vertexai`)

### Design & Styling
- **CSS Framework**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **Component Primitives**: [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Carousels/Sliders**: [Embla Carousel](https://www.embla-carousel.com/)

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed on your host machine:

- **Node.js**: `v20.x` or higher
- **Package Manager**: `npm` (v10+ recommended)
- **Docker**: For containerized deployment (optional but recommended)
- **Google Cloud / Vertex AI Credentials**: Required for Genkit pipeline execution.

---

## 🛠 Local Development Setup

### 1. Clone & Install Dependencies

```bash
# Install dependencies
npm install
```

### 2. Environment Configuration

The application requires specific environment variables to function properly. Copy the provided sample file:

```bash
cp .env.sample .env
```

**Required Variables Breakdown (`.env`):**

| Variable Category | Key | Description |
|---|---|---|
| **AI Configuration** | `GOOGLE_GENAI_API_KEY` | Your Gemini API Key obtained from [Google AI Studio](https://aistudio.google.com/). |
| | `INITIAL_AI_PORTRAIT_GENERATION_COUNT` | (Opt) Default number of images to generate on initialization. |
| | `ON_DEMAND_AI_PORTRAIT_GENERATION_NUM_TO_GENERATE` | (Opt) Batch size for on-demand generations. |
| **Notification Settings**| `SMTP_HOST`, `SMTP_PORT` | Details for the outgoing SMTP server (e.g., `smtp.gmail.com`). |
| | `SMTP_USER`, `SMTP_PASS` | SMTP authentication details (e.g., App Passwords). |
| | `SMTP_FROM`, `EMAIL_RECIPIENT` | Sender masking and destination email addresses. |
| **Quota Settings** | `NEXT_PUBLIC_REQUIRED_PORTRAIT` | Target number of portraits to be selected by the user. |
| | `NEXT_PUBLIC_REQUIRED_HALF_BODY` | Target number of half-body shots to be selected. |
| | `NEXT_PUBLIC_REQUIRED_FULL_BODY` | Target number of full-body shots to be selected. |

### 3. Running the Server

To support both the Next.js application and the Genkit developer UI, run the following commands in separate terminal sessions:

**Terminal 1: Next.js Web Application**
```bash
# Starts the development server using Turbopack on port 9002
npm run dev
```

**Terminal 2: Genkit Development UI**
```bash
# Starts the Genkit inspection, trace, and flow UI
npm run genkit:dev
```

- **Web Application Interface**: [http://localhost:9002](http://localhost:9002)
- **Genkit Trace UI**: [http://localhost:4000](http://localhost:4000)

---

## 🐳 Docker Deployment Strategy

For isolated environments or staging deployments, the project is configured for Dockerized instantiation.

### Using Docker Compose
A `docker-compose.yml` is provided for immediate spin-up:

```bash
# Build and start the container in detached mode
docker-compose up -d
```
*Note: Ensure the image tag in `docker-compose.yml` aligns with your built image.*

### Manual Docker Build
If you need to build the image manually:

```bash
# Build the Docker image
docker build -t image-selection:latest .

# Run the container
docker run -p 3000:3000 --env-file .env image-selection:latest
```

---

## 📁 Repository Structure

```text
oc-project/image-selection/
├── Dockerfile                  # Multi-stage Docker definitions
├── docker-compose.yml          # Container orchestration map
├── package.json                # Project dependencies and script aliases
├── src/
│   ├── ai/                     # Genkit architecture
│   │   ├── flows/              # Definition of generation orchestration pipelines
│   │   └── models/             # Prompt tuning and model parameters
│   ├── app/                    # Next.js App Router root
│   │   ├── api/                # Backend endpoints (e.g., /api/notify)
│   │   └── page.tsx            # Main application entry point
│   ├── components/             # Reusable UI architecture
│   │   ├── ui/                 # Atomic Shadcn/Radix components
│   │   └── ...                 # Complex operational components
│   └── lib/                    # Core utilities, Zod schemas, and helpers
├── public/                     # Static assets
└── saved_portraits/            # Local sink for curated assets
```

---

## 📜 Script Reference

The `package.json` provides standard commands for development and maintenance:

- `npm run dev` — Starts Next.js development server with Turbopack binding to port `9002`.
- `npm run build` — Compiles the application for production state.
- `npm run start` — Initializes the production server.
- `npm run lint` — Executes Next.js integrated ESLint checks.
- `npm run typecheck` — Executes strict TypeScript compilation (`tsc --noEmit`).
- `npm run genkit:dev` — Boots up Genkit local UI and flow runner.
- `npm run genkit:watch` — Boots up Genkit UI with auto-reloading attached via `tsx`.

---

## 🔐 License & Confidentiality

**Private Repository**

This codebase, its architecture, and associated assets are strictly confidential and intended for internal use only. Unauthorized distribution, replication, or usage is strictly prohibited.
