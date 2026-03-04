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
    // We generate 3 images initially to stay well within timeout limits
    const generationPrompts = [
      'a professional full body portrait from the front view',
      'a professional half body portrait from a three-quarter angle',
      'a professional close-up headshot looking at camera'
    ];

    const results: {url: string, description: string}[] = [];

    // Generate sequentially to avoid hitting rate limits or timeouts in parallel
    for (const description of generationPrompts) {
      try {
        const {media} = await ai.generate({
          model: 'googleai/gemini-2.5-flash-image',
          prompt: [
            {media: {url: input.photoDataUri}},
            {text: `Look at the person in the provided image. Generate a new high-quality professional portrait of THIS SAME PERSON. The new image should be: ${description}. Maintain the same facial features, hair style, and identity. Use professional studio lighting.`},
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
          results.push({url: media.url, description: description});
        }
      } catch (error) {
        // Silently skip failed individual generations to return what we have
        console.error(`Generation error for ${description}:`, error);
      }
    }

    return {generatedImages: results};
  }
);
