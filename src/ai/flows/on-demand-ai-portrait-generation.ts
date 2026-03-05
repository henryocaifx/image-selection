'use server';
/**
 * @fileOverview A Genkit flow for generating additional varied portrait images based on an uploaded photo.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
    const numToGenerate = 5;

    const variationPrompts = [
      "Generate a professional headshot of this EXACT SAME PERSON from a slight side profile angle. High resolution, cinematic lighting.",
      "Generate a professional half-body shot of this EXACT SAME PERSON. High resolution, professional setting, sharp focus.",
      "Generate a professional full-body shot of this EXACT SAME PERSON. High resolution, consistent identity, realistic texture.",
      "Generate a professional portrait of this EXACT SAME PERSON with a warm, natural lighting and a 3/4 face view.",
      "Generate a professional candid-style portrait of this EXACT SAME PERSON in a business casual environment."
    ];

    // Preload the model in Genkit's registry to prevent "already has an entry" warnings on parallel calls
    try {
      await ai.registry.lookupAction('/model/vertexai/gemini-3.1-flash-image-preview');
    } catch (_) { }

    const generationPromises = Array.from({ length: numToGenerate }).map(async (_, i) => {
      const startTime = Date.now();
      try {
        const promptText = variationPrompts[Math.floor(Math.random() * variationPrompts.length)];

        const { media } = await ai.generate({
          model: 'vertexai/gemini-3.1-flash-image-preview',
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
        console.error('On-demand generation failed:', error);
        return null;
      }
    });

    const results = await Promise.all(generationPromises);
    const generatedImages = results.filter((res): res is { url: string, generationTimeMs: number } => res !== null);
    return generatedImages;
  }
);
