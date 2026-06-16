'use server';

/**
 * @fileOverview A specialized conversational AI agent for the SGOD Workspace with Tool Calling capabilities.
 *
 * - divisionChat - A function that handles general intelligence queries and performs actions.
 * - ChatInput - The input type for the divisionChat function.
 * - ChatOutput - The return type for the divisionChat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, query, where, getDocs, limit, doc, updateDoc } from 'firebase/firestore';

// Initialize Firebase SDKs for server-side usage
const { firestore } = initializeFirebase();

/**
 * Tool: updatePersonnelStatus
 * Allows the AI to manage the duty status of division personnel.
 */
const updatePersonnelStatus = ai.defineTool(
  {
    name: 'updatePersonnelStatus',
    description: 'Updates the operational duty status of a personnel. Used for Leave, Official Business, or returning to Duty.',
    inputSchema: z.object({
      userId: z.string().describe('The Firebase UID of the user whose status is being updated.'),
      status: z.enum(['On Duty', 'On Leave', 'On Official Business', 'Absent']).describe('The new status.'),
      startDate: z.string().optional().describe('Effective start date in ISO format (if applicable).'),
      endDate: z.string().optional().describe('Expected return date in ISO format (if applicable).'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async (input) => {
    try {
      const userRef = doc(firestore, 'user_profiles', input.userId);
      await updateDoc(userRef, {
        status: input.status,
        statusStartDate: input.startDate || null,
        statusEndDate: input.endDate || null,
        statusUpdatedAt: new Date().toISOString(),
      });
      return { 
        success: true, 
        message: `Status for personnel updated to "${input.status}" successfully.` 
      };
    } catch (error) {
      console.error('Tool Error (updatePersonnelStatus):', error);
      return { success: false, message: 'Failed to update personnel status. Ensure user profile exists.' };
    }
  }
);

/**
 * Tool: createCalendarEntry
 * Allows the AI to add events or tasks to the SGOD calendar.
 */
const createCalendarEntry = ai.defineTool(
  {
    name: 'createCalendarEntry',
    description: 'Creates a new event or task in the SGOD operational calendar.',
    inputSchema: z.object({
      title: z.string().describe('The title of the event or task.'),
      description: z.string().describe('Detailed description of the activity.'),
      type: z.enum(['Event', 'Task']).describe('The category of the entry.'),
      date: z.string().describe('The target date in YYYY-MM-DD format.'),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  async (input) => {
    try {
      await addDoc(collection(firestore, 'division_events'), {
        ...input,
        date: new Date(input.date).toISOString(),
        createdAt: new Date().toISOString(),
      });
      return { success: true, message: `Successfully scheduled "${input.title}" for ${input.date}.` };
    } catch (error) {
      console.error('Tool Error (createCalendarEntry):', error);
      return { success: false, message: 'Failed to create calendar entry.' };
    }
  }
);

/**
 * Tool: getInfrastructureStatus
 * Allows the AI to retrieve progress data for specific schools.
 */
const getInfrastructureStatus = ai.defineTool(
  {
    name: 'getInfrastructureStatus',
    description: 'Retrieves the latest status and accomplishment percentage for school infrastructure projects.',
    inputSchema: z.object({
      schoolName: z.string().describe('The name of the school to look up.'),
    }),
    outputSchema: z.object({
      found: z.boolean(),
      projects: z.array(z.any()),
    }),
  },
  async (input) => {
    try {
      const q = query(
        collection(firestore, 'school_infrastructure'),
        where('schoolName', '>=', input.schoolName),
        limit(3)
      );
      const snapshot = await getDocs(q);
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { found: projects.length > 0, projects };
    } catch (error) {
      console.error('Tool Error (getInfrastructureStatus):', error);
      return { found: false, projects: [] };
    }
  }
);

const ChatInputSchema = z.object({
  message: z.string().describe('The user message or request.'),
  userId: z.string().describe('The UID of the current user for status context.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  text: z.string().describe('The AI generated response.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function divisionChat(input: ChatInput): Promise<ChatOutput> {
  return divisionChatFlow(input);
}

const divisionChatFlow = ai.defineFlow(
  {
    name: 'divisionChatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { text } = await ai.generate({
      system: `You are the SGOD Digital Assistant for the DepEd Division of Davao del Sur. 
      You have direct access to division operations via tools.
      
      CORE CAPABILITIES:
      1. Status Management: You are the ONLY way for personnel to update their duty status (Leave, Official Business, Absent, or On Duty). If a user says they are going on leave, ask for the dates and use updatePersonnelStatus.
      2. Scheduling: You can add events and tasks to the official calendar.
      3. Monitoring: You can look up infrastructure project status for any school.
      4. Facilities: You can log repair requests when users report issues.
      
      GUIDELINES:
      - ALWAYS use the provided userId (${input.userId}) when a user asks to update THEIR own status.
      - If a user mentions a leave or business trip, proactively ask for the start and end dates if not provided.
      - Always confirm the action you took (e.g., "I've updated your status to On Leave until April 10.").
      - Be professional, concise, and helpful.`,
      prompt: input.message,
      tools: [updatePersonnelStatus, createCalendarEntry, getInfrastructureStatus],
    });

    return { text };
  }
);