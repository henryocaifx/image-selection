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
import {googleAI} from '@genkit-ai/google-genai';

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
    // Reduced count to ensure reliability and avoid timeouts
    const generationPrompts = [
      'generate a professional full body portrait from the front view',
      'generate a professional half body portrait from a three-quarter angle',
      'generate a professional close-up headshot looking at camera',
      'generate a professional portrait from the side view',
      'generate a creative and dynamic professional portrait'
    ];

    const generationPromises = generationPrompts.map(async description => {
      try {
        const {media} = await ai.generate({
          model: 'googleai/gemini-2.5-flash-image',
          prompt: [
            {media: {url: input.photoDataUri}},
            {text: `Based on the provided image, ${description}. Ensure the person maintains their likeness but with the specified angle and composition. High quality professional lighting.`},
          ],
          config: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        });

        if (!media || !media.url) {
          return null;
        }

        return {url: media.url, description: description};
      } catch (error) {
        console.error(`Generation error for ${description}:`, error);
        return null;
      }
    });

    const results = await Promise.all(generationPromises);
    const validImages = results.filter((img): img is {url: string, description: string} => img !== null);

    return {generatedImages: validImages};
  }
);
