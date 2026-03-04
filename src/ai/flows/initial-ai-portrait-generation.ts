'use server';
/**
 * @fileOverview This file implements a Genkit flow for initial AI portrait generation.
 * It takes a single front-facing image of a person and generates a batch of varied portrait images
 * with different angles and body shots using the gemini-2.5-flash-image model.
 *
 * - initialAIPortraitGeneration - A function that handles the generation of initial portrait images.
 * - InitialAIPortraitGenerationInput - The input type for the initialAIPortraitGeneration function.
 * - InitialAIPortraitGenerationOutput - The return type for the initialAIPortraitGeneration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InitialAIPortraitGenerationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A front-facing photo of a person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type InitialAIPortraitGenerationInput = z.infer<
  typeof InitialAIPortraitGenerationInputSchema
>;

const GeneratedImageSchema = z.object({
  url: z
    .string()
    .describe(
      "The generated portrait image as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
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
    // Generate 2 high-quality portraits sequentially to maximize success rate
    const generationPrompts = [
      'professional close-up headshot, studio lighting, neutral background',
      'professional business portrait, three-quarter view, modern office background'
    ];

    const results: {url: string, description: string}[] = [];

    for (const description of generationPrompts) {
      try {
        const {media} = await ai.generate({
          model: 'googleai/gemini-2.5-flash-image',
          prompt: [
            {media: {url: input.photoDataUri}},
            {text: `Using the subject in the attached image as the direct reference, generate a ${description}. Maintain identical facial features, hair, and eye color. The output must be a photo-realistic portrait.`},
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
          results.push({url: media.url, description: description});
        }
      } catch (error) {
        console.warn(`Generation failed for prompt: ${description}`, error);
      }
    }

    return {generatedImages: results};
  }
);
