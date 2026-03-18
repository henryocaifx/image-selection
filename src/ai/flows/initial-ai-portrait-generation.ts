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
    const count = parseInt(process.env.INITIAL_AI_PORTRAIT_GENERATION_COUNT || '10'); // Generate 1 initial portraits as requested

    const promptsPath = path.join(process.cwd(), 'src', 'ai', 'prompts.md');
    const promptsContent = fs.readFileSync(promptsPath, 'utf8');
    const prompts = promptsContent
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#') && !line.startsWith('//'));

    // Preload the model in Genkit's registry to prevent "already has an entry" warnings on parallel calls
    try {
      await ai.registry.lookupAction('/model/googleai/gemini-3.1-flash-image-preview');
    } catch (_) { }

    const results: ({ url: string, description: string, generationTimeMs: number, category: string } | null)[] = [];
    const CONCURRENCY_LIMIT = parseInt(process.env.AI_GENERATION_CONCURRENCY_LIMIT || '3');

    for (let i = 0; i < count; i += CONCURRENCY_LIMIT) {
      const batchSize = Math.min(CONCURRENCY_LIMIT, count - i);
      const batchPromises = Array.from({ length: batchSize }).map(async (_, j) => {
        // Stagger intra-batch requests to prevent sudden HTTP socket connection drops (ECONNRESET)
        if (j > 0) await new Promise(resolve => setTimeout(resolve, j * 600));

        const index = i + j;
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
                category: categorizePrompt(promptText)
              };
            }
            return null;
          } catch (error) {
            lastError = error;
            retries--;
            if (retries > 0) {
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        }
        
        console.error(`Initial generation iteration ${index} failed after retries:`, lastError);
        return null;
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    const generatedImages = results.filter((res): res is { url: string, description: string, generationTimeMs: number, category: 'portrait' | 'half-body' | 'full-body' } => res !== null);
    return { generatedImages };
  }
);
