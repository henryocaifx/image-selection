import { genkit } from 'genkit';
import { vertexAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    vertexAI({
      projectId: 'welend-tvc-465903',
      location: 'global'
      // location: 'us-central1'
    })
  ],
  // The latest Image-specific Flash model ID
  model: 'vertexai/gemini-3.1-flash-image-preview',
});