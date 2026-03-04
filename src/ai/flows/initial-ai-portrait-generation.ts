'use server';
/**
 * @fileOverview This file implements a Genkit flow for initial AI portrait generation.
 * It takes a single front-facing image of a person and generates a batch of high-quality professional portraits.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
    const results: { url: string, description: string }[] = [];
    const count = 1; // Generate 1 initial portraits as requested

    const prompts = [
      "Using the person in the image as the reference, generate a professional close-up headshot, front-facing. EXACT SAME PERSON. Professional lighting, photorealistic.",
      "Using the person in the image as the reference, generate a professional close-up headshot with a 45-degree face angle. EXACT SAME PERSON. Professional lighting, photorealistic.",
      "Using the person in the image as the reference, generate a professional half-body portrait. EXACT SAME PERSON. Professional lighting, photorealistic.",
      "Using the person in the image as the reference, generate a professional full-body portrait. EXACT SAME PERSON. Professional lighting, photorealistic.",
      "Using the person in the image as the reference, generate a professional portrait from a different side angle. EXACT SAME PERSON. Professional lighting, photorealistic.",
    ];

    for (let i = 0; i < count; i++) {
      try {
        const { media } = await ai.generate({
          model: 'vertexai/gemini-3.1-flash-image-preview',
          prompt: [
            { media: { url: input.photoDataUri } },
            { text: prompts[i % prompts.length] },
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
          results.push({ url: media.url, description: `Portrait Variation ${i + 1}` });
        }
      } catch (error) {
        console.error(`Initial generation iteration ${i} failed:`, error);
      }
    }

    return { generatedImages: results };
  }
);
