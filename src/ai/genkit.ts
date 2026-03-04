import { genkit } from 'genkit';
import { vertexAI } from '@genkit-ai/google-genai';

const initGenkit = () => genkit({
  plugins: [
    vertexAI({
      projectId: 'welend-tvc-465903',
      location: 'global'
    })
  ],
  // The latest Image-specific Flash model ID
  model: 'vertexai/gemini-3.1-flash-image-preview',
});

const globalForGenkit = globalThis as unknown as {
  _aiInstance: ReturnType<typeof initGenkit> | undefined;
};

export const ai = globalForGenkit._aiInstance ?? initGenkit();

if (process.env.NODE_ENV !== 'production') {
  globalForGenkit._aiInstance = ai;
}