'use server';
/**
 * @fileOverview A Genkit flow for generating additional varied portrait images based on an uploaded photo.
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as fs from 'fs';
import * as path from 'path';

const OnDemandAIPortraitGenerationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a person's front face as a data URI."
    ),
  count: z
    .number()
    .int()
    .positive()
    .default(10)
    .describe('The number of additional varied portrait images to generate.'),
});
export type OnDemandAIPortraitGenerationInput = z.infer<
  typeof OnDemandAIPortraitGenerationInputSchema
>;

const OnDemandAIPortraitGenerationOutputSchema = z.array(z.object({
  url: z.string(),
  generationTimeMs: z.number().describe("Time taken to generate the image in milliseconds."),
}));
export type OnDemandAIPortraitGenerationOutput = z.infer<
  typeof OnDemandAIPortraitGenerationOutputSchema
>;

export async function generateAdditionalPortraits(
  input: OnDemandAIPortraitGenerationInput
): Promise<OnDemandAIPortraitGenerationOutput> {
  return onDemandAIPortraitGenerationFlow(input);
}

const onDemandAIPortraitGenerationFlow = ai.defineFlow(
  {
    name: 'onDemandAIPortraitGenerationFlow',
    inputSchema: OnDemandAIPortraitGenerationInputSchema,
    outputSchema: OnDemandAIPortraitGenerationOutputSchema,
  },
  async (input) => {
    // Requested count (usually 10)
    // const numToGenerate = input.count;
    const numToGenerate = parseInt(process.env.ON_DEMAND_AI_PORTRAIT_GENERATION_NUM_TO_GENERATE || '5');

    const promptsPath = path.join(process.cwd(), 'src', 'ai', 'prompts.md');
    const promptsContent = fs.readFileSync(promptsPath, 'utf8');
    const variationPrompts = promptsContent
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#') && !line.startsWith('//'));

    // Preload the model in Genkit's registry to prevent "already has an entry" warnings on parallel calls
    try {
      await ai.registry.lookupAction('/model/googleai/gemini-3.1-flash-image-preview');
    } catch (_) { }

    const results: ({ url: string, generationTimeMs: number } | null)[] = [];
    const CONCURRENCY_LIMIT = parseInt(process.env.AI_GENERATION_CONCURRENCY_LIMIT || '3');

    for (let i = 0; i < numToGenerate; i += CONCURRENCY_LIMIT) {
      const batchSize = Math.min(CONCURRENCY_LIMIT, numToGenerate - i);
      const batchPromises = Array.from({ length: batchSize }).map(async (_, j) => {
        // Stagger intra-batch requests to prevent sudden HTTP socket connection drops (ECONNRESET)
        if (j > 0) await new Promise(resolve => setTimeout(resolve, j * 600));

        const startTime = Date.now();
        let retries = 3;
        let lastError = null;

        while (retries > 0) {
          try {
            const promptText = variationPrompts[Math.floor(Math.random() * variationPrompts.length)];

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

            return media?.url ? { url: media.url, generationTimeMs: Date.now() - startTime } : null;
          } catch (error) {
            lastError = error;
            retries--;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        }
        
        console.error('On-demand generation failed after retries:', lastError);
        return null;
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    const generatedImages = results.filter((res): res is { url: string, generationTimeMs: number } => res !== null);
    return generatedImages;
  }
);
