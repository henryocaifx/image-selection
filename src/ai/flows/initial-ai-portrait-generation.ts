'use server';
/**
 * @fileOverview This file implements a Genkit flow for initial AI portrait generation.
 * It takes a single front-facing image of a person and generates a batch of high-quality professional portraits.
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as fs from 'fs';
import * as path from 'path';
import { categorizePrompt } from '@/lib/categorization';

const InitialAIPortraitGenerationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A front-facing photo of a person, as a data URI that must include a MIME type and use Base64 encoding."
    ),
  count: z.number().optional().describe("Number of images to generate."),
});
export type InitialAIPortraitGenerationInput = z.infer<
  typeof InitialAIPortraitGenerationInputSchema
>;

const GeneratedImageSchema = z.object({
  url: z
    .string()
    .describe("The generated portrait image as a data URI."),
  description: z
    .string()
    .describe('A textual description of the generated image.'),
  generationTimeMs: z.number().describe("Time taken to generate the image in milliseconds."),
  category: z.enum(['portrait', 'half-body', 'full-body']).describe("The category of the generated image."),
});

const InitialAIPortraitGenerationOutputSchema = z.object({
  generatedImages: z.array(GeneratedImageSchema).describe('An array of generated portrait images.'),
});
export type InitialAIPortraitGenerationOutput = z.infer<
  typeof InitialAIPortraitGenerationOutputSchema
>;

export async function initialAIPortraitGeneration(
  input: InitialAIPortraitGenerationInput
): Promise<InitialAIPortraitGenerationOutput> {
  return initialAIPortraitGenerationFlow(input);
}

const initialAIPortraitGenerationFlow = ai.defineFlow(
  {
    name: 'initialAIPortraitGenerationFlow',
    inputSchema: InitialAIPortraitGenerationInputSchema,
    outputSchema: InitialAIPortraitGenerationOutputSchema,
  },
  async input => {
    const count = input.count || parseInt(process.env.INITIAL_AI_PORTRAIT_GENERATION_COUNT || '10');

    const promptsPath = path.join(process.cwd(), 'src', 'ai', 'prompts.md');
    const promptsContent = fs.readFileSync(promptsPath, 'utf8');
    const prompts = promptsContent
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#') && !line.startsWith('//'));

    // Preload model
    try {
      await ai.registry.lookupAction('/model/googleai/gemini-3.1-flash-image-preview');
    } catch (_) { }

    const batchPromises = Array.from({ length: count }).map(async (_, index) => {
      const startTime = Date.now();
      let retries = 3;
      let lastError = null;

      while (retries > 0) {
        try {
          const promptText = prompts[Math.floor(Math.random() * prompts.length)];
          const { media } = await ai.generate({
            model: 'googleai/gemini-3.1-flash-image-preview',
            prompt: [
              { media: { url: input.photoDataUri } },
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

          if (media && media.url) {
            return {
              url: media.url,
              description: `Portrait Variation ${index + 1}`,
              generationTimeMs: Date.now() - startTime,
              category: categorizePrompt(promptText) as 'portrait' | 'half-body' | 'full-body'
            };
          }
          return null;
        } catch (error) {
          lastError = error;
          retries--;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      return null;
    });

    const results = await Promise.all(batchPromises);
    const generatedImages = results.filter((res): res is { url: string, description: string, generationTimeMs: number, category: 'portrait' | 'half-body' | 'full-body' } => res !== null);
    return { generatedImages };
  }
);
