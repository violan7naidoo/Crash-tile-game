'use server';

/**
 * @fileOverview Generates a reasonable initial value for the RTP (Return to Player) when the game is first set up.
 *
 * - generateInitialRTP - A function that generates the initial RTP value.
 * - GenerateInitialRTPOutput - The return type for the generateInitialRTP function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInitialRTPOutputSchema = z.object({
  initialRTP: z.number().describe('The generated initial RTP value as a percentage (e.g., 95.00 for 95%).'),
});
export type GenerateInitialRTPOutput = z.infer<typeof GenerateInitialRTPOutputSchema>;

export async function generateInitialRTP(): Promise<GenerateInitialRTPOutput> {
  return generateInitialRTPFlow({});
}

const prompt = ai.definePrompt({
  name: 'generateInitialRTPPrompt',
  output: {schema: GenerateInitialRTPOutputSchema},
  prompt: `You are a game design expert. Please generate a reasonable initial RTP (Return to Player) value for a simple online crash game.

The RTP should be a percentage between 90% and 99%. The output should be just a number (e.g., 95.00).`,
});

const generateInitialRTPFlow = ai.defineFlow(
  {
    name: 'generateInitialRTPFlow',
    outputSchema: GenerateInitialRTPOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
