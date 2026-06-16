
'use server';

/**
 * @fileOverview A Genkit flow for determining and updating user duty status based on activity.
 *
 * - updateDutyStatus - A server-side wrapper for the duty status flow.
 * - dutyStatusUpdaterFlow - The underlying Genkit flow logic.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export async function updateDutyStatus(input: { userId: string; lastActivity: string }) {
  return dutyStatusUpdaterFlow(input);
}

const dutyStatusUpdaterFlow = ai.defineFlow(
  {
    name: 'dutyStatusUpdaterFlow',
    inputSchema: z.object({
      userId: z.string(),
      lastActivity: z.string(),
    }),
    outputSchema: z.object({
      newStatus: z.string(),
    }),
  },
  async (input) => {
    /**
     * Operational Intelligence:
     * In a production environment, this would analyze activity logs to recommend status changes.
     * Current logic resets to 'On Duty' upon active engagement.
     */
    const newStatus = 'On Duty'; 

    return { newStatus };
  }
);
