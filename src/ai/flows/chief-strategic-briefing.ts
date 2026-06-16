'use server';

/**
 * @fileOverview A Genkit flow for generating a strategic briefing for an SGOD Chief.
 *
 * - chiefStrategicBriefing - A function that generates a strategic briefing.
 * - ChiefStrategicBriefingInput - The input type for the chiefStrategicBriefing function.
 * - ChiefStrategicBriefingOutput - The return type for the chiefStrategicBriefing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input schema for the chief strategic briefing flow
const ChiefStrategicBriefingInputSchema = z.object({
  fullPromptText: z
    .string()
    .describe(
      'The complete prompt text for generating the strategic briefing, including all relevant dashboard data and instructions.'
    ),
});
export type ChiefStrategicBriefingInput = z.infer<
  typeof ChiefStrategicBriefingInputSchema
>;

// Output schema for the chief strategic briefing flow
const ChiefStrategicBriefingOutputSchema = z.object({
  briefing: z.string().describe('A high-level strategic briefing.'),
  risks: z.array(z.string()).describe('Identified risks based on the data.'),
  prioritizedActions: z
    .array(z.string())
    .describe('Prioritized actions for the next 48 hours.'),
});
export type ChiefStrategicBriefingOutput = z.infer<
  typeof ChiefStrategicBriefingOutputSchema
>;

// Define the prompt for generating the strategic briefing
const strategicBriefingPrompt = ai.definePrompt({
  name: 'strategicBriefingPrompt',
  input: {schema: ChiefStrategicBriefingInputSchema},
  output: {schema: ChiefStrategicBriefingOutputSchema},
  system: 'Executive Briefing: Strategic Analysis Engine',
  prompt: '{{{fullPromptText}}}',
});

// Define the Genkit flow
const chiefStrategicBriefingFlow = ai.defineFlow(
  {
    name: 'chiefStrategicBriefingFlow',
    inputSchema: ChiefStrategicBriefingInputSchema,
    outputSchema: ChiefStrategicBriefingOutputSchema,
  },
  async (input) => {
    const {output} = await strategicBriefingPrompt(input);
    if (!output) {
      throw new Error('Failed to generate strategic briefing.');
    }
    return output;
  }
);

// Export wrapper function for the flow
export async function chiefStrategicBriefing(
  input: ChiefStrategicBriefingInput
): Promise<ChiefStrategicBriefingOutput> {
  return chiefStrategicBriefingFlow(input);
}
