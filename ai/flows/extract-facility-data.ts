'use server';
/**
 * @fileOverview A high-precision Genkit flow for extracting school infrastructure records.
 * Uses advanced prompt engineering to ensure accurate tabular data mapping from PDFs and images.
 *
 * - extractFacilityData - The primary extraction function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InfrastructureRecordSchema = z.object({
  projectId: z.string().describe('The technical project ID (e.g., 2024-DDS-001) or unique reference code.'),
  schoolName: z.string().describe('The full official name of the educational institution.'),
  municipality: z.string().describe('The specific town, district, or municipality.'),
  scopeOfWork: z.string().describe('Detailed technical description of the project tasks.'),
  projectCost: z.string().describe('Total contract cost or allocated budget. Must include Peso sign (₱).'),
  contractorName: z.string().describe('The name of the construction firm or individual contractor.'),
  targetCompletionDate: z.string().describe('The scheduled date of completion formatted as YYYY-MM-DD.'),
  latestAccomplishment: z.string().describe('Numeric percentage of progress (e.g., "75.5%"). Always includes the % sign.'),
  status: z.string().describe('Current operational status: ON-GOING, COMPLETED, or SUSPENDED.'),
});

const ExtractFacilityInputSchema = z.object({
  documentDataUri: z.string().describe("A data URI of a document (PDF or image). Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type ExtractFacilityInput = z.infer<typeof ExtractFacilityInputSchema>;

const ExtractFacilityOutputSchema = z.object({
  records: z.array(InfrastructureRecordSchema).describe('An array of detected infrastructure records.'),
});
export type ExtractFacilityOutput = z.infer<typeof ExtractFacilityOutputSchema>;

export async function extractFacilityData(input: ExtractFacilityInput): Promise<ExtractFacilityOutput> {
  return extractFacilityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractFacilityPrompt',
  input: { schema: ExtractFacilityInputSchema },
  output: { schema: ExtractFacilityOutputSchema },
  prompt: `You are a high-precision data extraction agent specialized in Department of Education (DepEd) school infrastructure reports for Davao del Sur.

TASK:
Identify and extract project records from the provided document (PDF or Image). These documents typically contain tables showing ongoing or completed construction projects.

EXTRACTION HIERARCHY:
For each row identified in a table, extract a complete 'InfrastructureRecord'. 

DATA INTEGRITY RULES (STRICT):
1. **Filter Dirty Data**: Do NOT include rows that are purely headers, footers, summary totals, labels (e.g. "Page 1 of 5"), or empty spacers.
2. **Mandatory Fields**: A valid record MUST have a School Name and either a Project ID or Scope of Work. Discard incomplete rows.
3. **Format Normalization**:
   - Project IDs must be alphanumeric technical codes.
   - Latest Accomplishment MUST be a percentage (e.g., "100.0%", "0.0%").
   - Project Cost MUST start with ₱. Use "₱ 0.00" if value is missing.
   - Dates MUST be YYYY-MM-DD.
4. **Logic Recovery**: If a row is missing a municipality but it's clearly grouped under a heading or previous row's municipality, fill it in.
5. **No Hallucination**: Do not invent project IDs or school names. If they aren't clear, skip the row.

FIELD-SPECIFIC INTELLIGENCE:
1. **Project ID**: Look for identifiers like "ID", "PRJ", "Project Ref", or alpha-numeric codes.
2. **School Name**: The full name of the elementary or high school.
3. **Municipality**: The town or district (e.g., Digos City, Bansalan, Magsaysay).
4. **Scope of Work**: The technical description (e.g., "Construction of 2-Storey 4-Classroom Building").
5. **Project Cost**: Use the Contract Amount or Total Cost. Format: Start with ₱.
6. **Latest Accomplishment**: Extract ONLY the number and append '%'.
7. **Status**: Classify: 'COMPLETED' (100%), 'ON-GOING' (1-99%), 'SUSPENDED' (stalled).

Document: {{media url=documentDataUri}}`,
});

const extractFacilityFlow = ai.defineFlow(
  {
    name: 'extractFacilityFlow',
    inputSchema: ExtractFacilityInputSchema,
    outputSchema: ExtractFacilityOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    
    if (!output || !output.records) {
      throw new Error("The AI engine failed to parse the document structure.");
    }

    // Secondary Cleanliness Filter: Explicitly remove records that look like noise or headers
    const cleanRecords = output.records.filter(record => {
      const isHeader = record.schoolName.toLowerCase().includes('name of school') || 
                       record.projectId.toLowerCase().includes('project id') ||
                       record.schoolName.toLowerCase().includes('list of projects');
      
      const hasMinimumData = record.schoolName && record.schoolName.length > 3 &&
                            record.projectId && record.projectId.length > 2;

      return !isHeader && hasMinimumData;
    });

    if (cleanRecords.length === 0) {
      throw new Error("The AI could not identify any valid project rows in this document. Please ensure the document contains a clear project table.");
    }

    return { records: cleanRecords };
  }
);