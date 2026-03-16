'use server';
/**
 * @fileOverview A Genkit flow for generating additional varied portrait images based on an uploaded photo.
 */
import * as dotenv from 'dotenv';
dotenv.config();

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
    const numToGenerate = parseInt(process.env.ON_DEMAND_AI_PORTRAIT_GENERATION_NUM_TO_GENERATE || '5');

    const variationPrompts = [
      "Using the person in the image as the reference, generate a close-up headshot, front-facing. EXACT SAME PERSON. studio lighting, photorealistic.",
      "Using the person in the image as the reference, generate a close-up headshot with a 45-degree face angle. EXACT SAME PERSON. studio lighting, photorealistic.",
      "Using the person in the image as the reference, generate a half-body portrait. EXACT SAME PERSON. studio lighting, photorealistic.",
      "Using the person in the image as the reference, generate a full-body portrait. EXACT SAME PERSON. studio lighting, photorealistic.",
      "Using the person in the image as the reference, generate a portrait from a different side angle. EXACT SAME PERSON. studio lighting, photorealistic.",
      "Using the person in the image as the reference, generate a close-up headshot, front-facing. EXACT SAME PERSON. natural daytime lighting, photorealistic.",
      "Using the person in the image as the reference, generate a close-up headshot with a 45-degree face angle. EXACT SAME PERSON. natural daytime lighting, photorealistic.",
      "Using the person in the image as the reference, generate a half-body portrait. EXACT SAME PERSON. natural daytime lighting, photorealistic.",
      "Using the person in the image as the reference, generate a full-body portrait. EXACT SAME PERSON. natural daytime lighting, photorealistic.",
      "Using the person in the image as the reference, generate a portrait from a different side angle. EXACT SAME PERSON. natural daytime lighting, photorealistic.",
      "Using the person in the image as the reference, generate a close-up headshot, front-facing. EXACT SAME PERSON. night time, photorealistic.",
      "Using the person in the image as the reference, generate a close-up headshot with a 45-degree face angle. EXACT SAME PERSON. night time, photorealistic.",
      "Using the person in the image as the reference, generate a portrait from a different side angle. EXACT SAME PERSON. night time, photorealistic.",
      "Using the person in the image as the reference, generate a close-up headshot, front-facing. EXACT SAME PERSON. outdoor natural lighting, photorealistic.",
      "Using the person in the image as the reference, generate a close-up headshot with a 45-degree face angle. EXACT SAME PERSON. outdoor natural lighting, photorealistic.",
      "Using the person in the image as the reference, generate a half-body portrait. EXACT SAME PERSON. outdoor natural lighting, photorealistic.",
      "Using the person in the image as the reference, generate a portrait from a different side angle. EXACT SAME PERSON. outdoor natural lighting, photorealistic."
    ];

    // const variationPrompts = [
    //   // --- BASE STUDIO SHOTS (Mirroring image) ---
    //   // Row 1: Tilted Up (High Pitch)
    //   "Using the person in image as reference, generate a close-up headshot, profile view (90-degree), head tilted up, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a close-up headshot, three-quarter view (45-degree), head tilted up, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a close-up headshot, straight-on front view, head tilted up, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a close-up headshot, three-quarter view (opposite 45-degree), head tilted up, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a close-up headshot, profile view (opposite 90-degree), head tilted up, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",

    //   // Row 2: Eye Level (Neutral Pitch)
    //   "Using the person in image as reference, generate a close-up headshot, profile view (90-degree), eye level, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a close-up headshot, three-quarter view (45-degree), eye level, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a close-up headshot, straight-on front view, eye level, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a close-up headshot, three-quarter view (opposite 45-degree), eye level, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a close-up headshot, profile view (opposite 90-degree), eye level, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",

    //   // Row 3: Tilted Down (Low Pitch)
    //   "Using the person in image as reference, generate a close-up headshot, profile view (90-degree), head tilted down, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a close-up headshot, three-quarter view (45-degree), head tilted down, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a close-up headshot, straight-on front view, head tilted down, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a close-up headshot, three-quarter view (opposite 45-degree), head tilted down, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a close-up headshot, profile view (opposite 90-degree), head tilted down, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",

    //   // --- LIGHTING & SEASON VARIATIONS (Mixed Angles) ---
    //   // Studio Variations (Alternative Lighting Setups)
    //   "Using the person in image as reference, generate a close-up headshot, 45-degree face angle, head level, dramatic chiaroscuro studio lighting (single side key light), dark background. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a close-up headshot, front view, head level, soft, diffused beauty studio lighting (butterfly setup), white background. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a close-up headshot, 3/4 view, head level, dramatic loop studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a close-up headshot, 3/4 view, head level, split studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a close-up headshot, 3/4 view, head level, Rembrandt studio lighting. EXACT SAME PERSON. photorealistic.",

    //   // Outdoor/Seasons - Clear Conditions
    //   "Using the person in image as reference, generate a close-up headshot, 45-degree face angle, eye level. Outdoor location, bright sunny summer day, direct strong sunlight, harsh shadows. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a close-up headshot, profile view, head tilted down. Outdoor location, spring time afternoon, gentle natural light, soft bokeh background. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a close-up headshot, front view, eye level. Outdoor location, bright winter sun, cold blue environmental tones. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a close-up headshot, profile view, head level. Outdoor location, overcast cloudy day, soft even natural light. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a close-up headshot, three-quarter view, head level. Outdoor location, dramatic golden hour sunset, warm rim light. EXACT SAME PERSON. photorealistic.",

    //   // Outdoor/Weather - Diffused/Specific
    //   "Using the person in image as reference, generate a close-up headshot, 45-degree face angle, head level. Outdoor location, heavy cloud cover, diffused, flat natural light. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a close-up headshot, front view, head level. Outdoor location, rainy day, person standing under an awning, cool ambient light, visible rain streaks. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a close-up headshot, front view, head level. Outdoor location, light autumn drizzle, gentle misting, soft diffused light. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a close-up headshot, 3/4 view, head level. Outdoor location, light snowfall in winter, cool light, soft flakes. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a close-up headshot, 3/4 view, head level. Indoor location near a window, afternoon sun, window light. EXACT SAME PERSON. photorealistic.",

    //   // Night/Low Light
    //   "Using the person in image as reference, generate a close-up headshot, 45-degree face angle, eye level. Outdoor location, nighttime, street lamp illumination, warm tungsten light. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a close-up headshot, profile view, head level. Urban nighttime location, illuminated primarily by multi-colored neon signs (cyberpunk aesthetic), cool blue and pink tones. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a close-up headshot, front view, head level. Indoor nighttime, candle lit, very low key lighting, soft warm flickering light. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a close-up headshot, front view, head level. Nighttime near a firepit, fire light. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a close-up headshot, front view, head level. Nighttime near a campfire, fire light. EXACT SAME PERSON. photorealistic."
    // ];

    // const variationPrompts = [
    //   // --- BASE STUDIO SHOTS (Mirroring image) ---
    //   // Row 1: Tilted Up (High Pitch)
    //   "Using the person in image as reference, generate a front full body shot, standing posture, head tilted up, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a left full body shot, profile view (90-degree), head tilted up, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a right full body shot, profile view (90-degree), head tilted up, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a 3 quarter full body shot (45-degree), head tilted up, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a front half body shot, standing posture, head tilted up, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a left half body shot, profile view (90-degree), head tilted up, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a right half body shot, profile view (90-degree), head tilted up, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a 3 quarter half body shot (45-degree), head tilted up, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",

    //   // Row 2: Eye Level (Neutral Pitch)
    //   "Using the person in image as reference, generate a front full body shot, standing posture, eye level, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a left full body shot, profile view (90-degree), eye level, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a right full body shot, profile view (90-degree), eye level, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a 3 quarter full body shot (45-degree), eye level, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a front half body shot, standing posture, eye level, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a left half body shot, profile view (90-degree), eye level, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a right half body shot, profile view (90-degree), eye level, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a 3 quarter half body shot (45-degree), eye level, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",

    //   // Row 3: Tilted Down (Low Pitch)
    //   "Using the person in image as reference, generate a front full body shot, standing posture, head tilted down, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a left full body shot, profile view (90-degree), head tilted down, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a right full body shot, profile view (90-degree), head tilted down, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a 3 quarter full body shot (45-degree), head tilted down, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a front half body shot, standing posture, head tilted down, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a left half body shot, profile view (90-degree), head tilted down, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a right half body shot, profile view (90-degree), head tilted down, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a 3 quarter half body shot (45-degree), head tilted down, standard high-key studio lighting. EXACT SAME PERSON. photorealistic.",

    //   // --- LIGHTING & SEASON VARIATIONS (Mixed Angles) ---
    //   // Studio Variations (Alternative Lighting Setups)
    //   "Using the person in image as reference, generate a front full body shot, dramatic chiaroscuro studio lighting (single side key light), dark background. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a front half body shot, dramatic chiaroscuro studio lighting (single side key light), dark background. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a 3 quarter full body shot, soft, diffused beauty studio lighting (butterfly setup), white background. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a 3 quarter half body shot, soft, diffused beauty studio lighting (butterfly setup), white background. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a left full body shot, dramatic loop studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a left half body shot, dramatic loop studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a right full body shot, split studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a right half body shot, split studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a 3 quarter full body shot, Rembrandt studio lighting. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a 3 quarter half body shot, Rembrandt studio lighting. EXACT SAME PERSON. photorealistic.",

    //   // Outdoor/Seasons - Clear Conditions
    //   "Using the person in image as reference, generate a front full body shot. Outdoor location, bright sunny summer day, direct strong sunlight, harsh shadows. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a front half body shot. Outdoor location, bright sunny summer day, direct strong sunlight, harsh shadows. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a 3 quarter full body shot. Outdoor location, spring time afternoon, gentle natural light, soft bokeh background. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a 3 quarter half body shot. Outdoor location, spring time afternoon, gentle natural light, soft bokeh background. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a left full body shot. Outdoor location, bright winter sun, cold blue environmental tones. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a left half body shot. Outdoor location, bright winter sun, cold blue environmental tones. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a right full body shot. Outdoor location, overcast cloudy day, soft even natural light. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a right half body shot. Outdoor location, overcast cloudy day, soft even natural light. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a 3 quarter full body shot. Outdoor location, dramatic golden hour sunset, warm rim light. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a 3 quarter half body shot. Outdoor location, dramatic golden hour sunset, warm rim light. EXACT SAME PERSON. photorealistic.",

    //   // Outdoor/Weather - Diffused/Specific
    //   "Using the person in image as reference, generate a front full body shot. Outdoor location, heavy cloud cover, diffused, flat natural light. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a front half body shot. Outdoor location, heavy cloud cover, diffused, flat natural light. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a 3 quarter full body shot. Outdoor location, rainy day, person standing under an awning, cool ambient light, visible rain streaks. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a 3 quarter half body shot. Outdoor location, rainy day, person standing under an awning, cool ambient light, visible rain streaks. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a left full body shot. Outdoor location, light autumn drizzle, gentle misting, soft diffused light. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a left half body shot. Outdoor location, light autumn drizzle, gentle misting, soft diffused light. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a right full body shot. Outdoor location, light snowfall in winter, cool light, soft flakes. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a right half body shot. Outdoor location, light snowfall in winter, cool light, soft flakes. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a 3 quarter full body shot. Indoor location near a window, afternoon sun, window light. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a 3 quarter half body shot. Indoor location near a window, afternoon sun, window light. EXACT SAME PERSON. photorealistic.",

    //   // Night/Low Light
    //   "Using the person in image as reference, generate a front full body shot. Outdoor location, nighttime, street lamp illumination, warm tungsten light. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a front half body shot. Outdoor location, nighttime, street lamp illumination, warm tungsten light. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a 3 quarter full body shot. Urban nighttime location, illuminated primarily by multi-colored neon signs (cyberpunk aesthetic), cool blue and pink tones. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a 3 quarter half body shot. Urban nighttime location, illuminated primarily by multi-colored neon signs (cyberpunk aesthetic), cool blue and pink tones. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a left full body shot. Indoor nighttime, candle lit, very low key lighting, soft warm flickering light. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a left half body shot. Indoor nighttime, candle lit, very low key lighting, soft warm flickering light. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a right full body shot. Nighttime near a firepit, fire light. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a right half body shot. Nighttime near a firepit, fire light. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a 3 quarter full body shot. Nighttime near a campfire, fire light. EXACT SAME PERSON. photorealistic.",
    //   "Using the person in image as reference, generate a 3 quarter half body shot. Nighttime near a campfire, fire light. EXACT SAME PERSON. photorealistic."
    // ];

    // Preload the model in Genkit's registry to prevent "already has an entry" warnings on parallel calls
    try {
      await ai.registry.lookupAction('/model/googleai/gemini-3.1-flash-image-preview');
    } catch (_) { }

    const generationPromises = Array.from({ length: numToGenerate }).map(async (_, i) => {
      const startTime = Date.now();
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
        console.error('On-demand generation failed:', error);
        return null;
      }
    });

    const results = await Promise.all(generationPromises);
    const generatedImages = results.filter((res): res is { url: string, generationTimeMs: number } => res !== null);
    return generatedImages;
  }
);
