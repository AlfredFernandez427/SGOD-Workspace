'use server';
/**
 * @fileOverview A Genkit flow for generating a professional BERF research abstract.
 *
 * - generateResearchAbstract - A function that handles the research abstract generation process.
 * - ResearchAbstractInput - The input type for the generateResearchAbstract function.
 * - ResearchAbstractOutput - The return type for the generateResearchAbstract function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResearchAbstractInputSchema = z.object({
  problem: z.string().describe('The problem statement for the research.'),
  participants: z.string().describe('The target participants for the research.'),
  intervention: z.string().describe('The proposed intervention for the research.'),
});
export type ResearchAbstractInput = z.infer<typeof ResearchAbstractInputSchema>;

const ResearchAbstractOutputSchema = z.object({
  abstract: z.string().describe('The generated professional BERF research abstract.'),
});
export type ResearchAbstractOutput = z.infer<typeof ResearchAbstractOutputSchema>;

export async function generateResearchAbstract(
  input: ResearchAbstractInput
): Promise<ResearchAbstractOutput> {
  return researchAbstractFlow(input);
}

const prompt = ai.definePrompt({
  name: 'berfAbstractPrompt',
  input: {schema: ResearchAbstractInputSchema},
  output: {schema: ResearchAbstractOutputSchema},
  prompt: `You are an AI assistant specialized in drafting professional academic abstracts for the Basic Education Research Fund (BERF).

Based on the following information, draft a comprehensive and well-structured action research abstract (approximately 150-200 words). The abstract should clearly include:
1.  **Rationale:** The justification for the study, addressing the significance of the problem.
2.  **Methodology:** A brief description of the approach, including the participants and intervention.
3.  **Expected Significance:** The potential contributions or benefits of the research.

Problem Statement: {{{problem}}}
Target Participants: {{{participants}}}
Proposed Intervention: {{{intervention}}}`,
});

const researchAbstractFlow = ai.defineFlow(
  {
    name: 'researchAbstractFlow',
    inputSchema: ResearchAbstractInputSchema,
    outputSchema: ResearchAbstractOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
