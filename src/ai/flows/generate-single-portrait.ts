'use server';

import { ai } from '@/ai/genkit';
import * as fs from 'fs';
import * as path from 'path';
import { categorizePrompt } from '@/lib/categorization';

/**
 * Generates a single portrait image.
 * This is designed to be called multiple times from the client for progressive loading.
 */
export async function generateSinglePortrait(photoDataUri: string) {
  const promptsPath = path.join(process.cwd(), 'src', 'ai', 'prompts.md');
  const promptsContent = fs.readFileSync(promptsPath, 'utf8');
  const prompts = promptsContent
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#') && !line.startsWith('//'));

  const startTime = Date.now();
  const promptText = prompts[Math.floor(Math.random() * prompts.length)];

  try {
    const { media } = await ai.generate({
      model: 'googleai/gemini-3.1-flash-image-preview',
      prompt: [
        { media: { url: photoDataUri } },
        { text: promptText },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' },
        ],
      },
    });

    if (media?.url) {
      return {
        url: media.url,
        generationTimeMs: Date.now() - startTime,
        category: categorizePrompt(promptText) as 'portrait' | 'half-body' | 'full-body',
      };
    }
    return null;
  } catch (error) {
    console.error("Single portrait generation failed:", error);
    return null;
  }
}
