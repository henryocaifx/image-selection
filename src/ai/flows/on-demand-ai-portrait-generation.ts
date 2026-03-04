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
  'Generate a full-body portrait of this person from a slightly different angle, in a dynamic pose, suitable for professional use.',
  'Generate a half-body portrait of this person, focusing on the upper body, with a thoughtful expression and soft lighting.',
  'Generate a close-up portrait of this person from a subtle three-quarter angle, with a gentle smile, suitable for a profile picture.',
  'Generate a full-body portrait of this person looking directly at the viewer, standing casually, with a clean background.',
  'Generate a half-body portrait of this person, from a slightly lower angle, conveying confidence and professionalism.',
];

const onDemandAIPortraitGenerationFlow = ai.defineFlow(
  {
    name: 'onDemandAIPortraitGenerationFlow',
    inputSchema: OnDemandAIPortraitGenerationInputSchema,
    outputSchema: OnDemandAIPortraitGenerationOutputSchema,
  },
  async (input) => {
    const generatedImages: string[] = [];
    const numToGenerate = Math.min(input.count, 3); // Capping at 3 per request for reliability

    for (let i = 0; i < numToGenerate; i++) {
      const promptText = variationPrompts[i % variationPrompts.length];

      try {
        const { media } = await ai.generate({
          model: 'googleai/gemini-2.5-flash-image',
          prompt: [
            { media: { url: input.photoDataUri } },
            { text: `Based on the provided image, generate a new portrait of the EXACT SAME PERSON. ${promptText} Maintain likeness and identity.` },
          ],
          config: {
            responseModalities: ['TEXT', 'IMAGE'],
            safetySettings: [
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_ONLY_HIGH',
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_ONLY_HIGH',
              },
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_ONLY_HIGH',
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_ONLY_HIGH',
              },
            ],
          },
        });

        if (media && media.url) {
          generatedImages.push(media.url);
        }
      } catch (error) {
        console.warn(`Image generation failed for iteration ${i}:`, error);
      }
    }
    return generatedImages;
  }
);
