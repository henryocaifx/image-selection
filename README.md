# AI-FX Image Selection & Persona Generator

This is a Next.js web application designed for high-fidelity AI persona generation and image selection. It leverages Google Genkit, Vertex AI, and Firebase to generate, manage, and curate character variations and likeness models.

## Features

- **High-Fidelity Actor Likeness Modeling**: Generates persona images maintaining facial and identity consistency.
- **Multi-Angle Generation**: Create variations of an actor from a reference photo in different angles (e.g., 90°, 45°) and compositions (half-body, full-body).
- **Image Curating & Selection**: A streamlined UI to manage and select generated photos.
- **Workflow Notifications**: Automated email notifications upon completed image selections.
- **Firebase Integration**: Robust infrastructure for state, storage, and actor profile management.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (Version 15, App Router)
- **UI/Styling**: [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Radix UI](https://www.radix-ui.com/), `lucide-react`
- **AI Services**: [Google Genkit](https://firebase.google.com/docs/genkit), [Vertex AI](https://cloud.google.com/vertex-ai)
- **Backend & Storage**: [Firebase](https://firebase.google.com/)
- **Utilities**: `zod` for validation, `nodemailer` for email dispatch

## Getting Started

### Prerequisites

You need Node.js installed along with package managers such as `npm` or `yarn`.

### Environment Configuration

Before running the application, ensure to set up your `.env.local` with the necessary API keys and credentials:
- `GEMINI_API_KEY` or Vertex AI Service Account credentials
- Firebase configuration details
- SMTP details for `nodemailer` (for notifications)

### Installation

Install the project dependencies:

```bash
npm install
# or
yarn install
```

### Running the Development Server

1. Start the Next.js development server:

```bash
npm run dev
# or
yarn dev
```

The application will be accessible at [http://localhost:9002](http://localhost:9002) (Port configured via turbopack in package scripts).

2. You can separately start the Genkit development environment by running:

```bash
npm run genkit:dev
# or watch mode
npm run genkit:watch
```

## Available Scripts

- `dev`: Start the Next.js development server on port 9002.
- `build`: Build the Next.js application for production.
- `start`: Run the optimized production build.
- `lint`: Run Next.js built-in ESLint.
- `typecheck`: Verify TypeScript typing without emitting files.
- `genkit:dev`: Launch the Genkit server/runner.

## License

Private.
