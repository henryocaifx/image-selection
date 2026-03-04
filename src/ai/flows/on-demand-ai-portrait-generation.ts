'use server';
/**
 * @fileOverview A Genkit flow for generating additional varied portrait images based on an uploaded photo.
 *
 * - generateAdditionalPortraits - A function that handles the generation of additional portrait images.
 * - OnDemandAIPortraitGenerationInput - The input type for the generateAdditionalPortraits function.
 * - OnDemandAIPortraitGenerationOutput - The return type for the generateAdditionalPortraits function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const OnDemandAIPortraitGenerationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a person's front face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  count: z
    .number()
    .int()
    .positive()
    .default(3)
    .describe('The number of additional varied portrait images to generate.'),
});
export type OnDemandAIPortraitGenerationInput = z.infer<
  typeof OnDemandAIPortraitGenerationInputSchema
>;

const OnDemandAIPortraitGenerationOutputSchema = z.array(
  z
    .string()
    .describe(
      "A generated portrait image as a data URI that includes a MIME type and uses Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    )
);
export type OnDemandAIPortraitGenerationOutput = z.infer<
  typeof OnDemandAIPortraitGenerationOutputSchema
>;

export async function generateAdditionalPortraits(
  input: OnDemandAIPortraitGenerationInput
): Promise<OnDemandAIPortraitGenerationOutput> {
  return onDemandAIPortraitGenerationFlow(input);
}

const variationPrompts = [
  'professional outdoor headshot with natural sunlight',
  'creative studio portrait with dramatic rim lighting',
  'confident business profile photo',
  'natural laughing candid portrait in a cafe',
  'clean corporate headshot on white background',
];

const onDemandAIPortraitGenerationFlow = ai.defineFlow(
  {
    name: 'onDemandAIPortraitGenerationFlow',
    inputSchema: OnDemandAIPortraitGenerationInputSchema,
    outputSchema: OnDemandAIPortraitGenerationOutputSchema,
  },
  async (input) => {
    const generatedImages: string[] = [];
    const numToGenerate = Math.min(input.count, 2); 

    for (let i = 0; i < numToGenerate; i++) {
      const promptText = variationPrompts[Math.floor(Math.random() * variationPrompts.length)];

      try {
        const { media } = await ai.generate({
          model: 'googleai/gemini-2.5-flash-image',
          prompt: [
            { media: { url: input.photoDataUri } },
            { text: `Using the subject in the attached image as a direct reference, generate a ${promptText}. Maintain identical facial structure and features. The output must be a photo-realistic portrait.` },
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
          generatedImages.push(media.url);
        }
      } catch (error) {
        console.warn(`On-demand generation failed for iteration ${i}`, error);
      }
    }
    return generatedImages;
  }
);
