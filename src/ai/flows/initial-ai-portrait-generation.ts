'use server';
/**
 * @fileOverview This file implements a Genkit flow for initial AI portrait generation.
 * It takes a single front-facing image of a person and generates 10 varied portrait images
 * with different angles and body shots using the Nano Banana model (gemini-2.5-flash-image).
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
    .describe('A textual description of the generated image, e.g., "full body, front view".'),
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
    const generationPrompts = [
      'generate a full body portrait from the front view',
      'generate a half body portrait from the front view',
      'generate a close-up portrait from the front view',
      'generate a full body portrait from a three-quarter angle',
      'generate a half body portrait from a three-quarter angle',
      'generate a close-up portrait from a three-quarter angle',
      'generate a full body portrait from the side view',
      'generate a half body portrait from the side view',
      'generate a close-up portrait from the side view',
      'generate a portrait with a dynamic and unique angle, focusing on the person',
    ];

    const generatedImages: {url: string; description: string}[] = [];

    // Extract content type from the input photoDataUri
    const uriParts = input.photoDataUri.split(';');
    let inputContentType = 'application/octet-stream';
    if (uriParts.length > 0 && uriParts[0].startsWith('data:')) {
      inputContentType = uriParts[0].substring(5);
    }

    const generationPromises = generationPrompts.map(async description => {
      try {
        const {media} = await ai.generate({
          model: googleAI.model('gemini-2.5-flash-image'), // "Nano Banana" model
          prompt: [
            {media: {url: input.photoDataUri, contentType: inputContentType}},
            {text: `Based on the provided image of a person, ${description}. Focus on variations in angle and body shot. Ensure the generated image is a portrait of the person.`},
          ],
          config: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        });

        if (!media || !media.url) {
          console.warn(`No image media returned for description: ${description}`);
          return null; // Return null for failed generations
        }

        return {url: media.url, description: description};
      } catch (error) {
        console.error(`Error generating image for description "${description}":`, error);
        return null; // Return null for failed generations
      }
    });

    const results = await Promise.all(generationPromises);

    results.forEach(result => {
      if (result) {
        generatedImages.push(result);
      }
    });

    return {generatedImages};
  }
);
