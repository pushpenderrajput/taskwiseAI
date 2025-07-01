'use server';

/**
 * @fileOverview This file defines a Genkit flow for summarizing completed task reports using AI.
 *
 * - summarizeReport - A function that takes a report as input and returns an AI-powered summary.
 * - SummarizeReportInput - The input type for the summarizeReport function, which is the report content.
 * - SummarizeReportOutput - The return type for the summarizeReport function, which is the AI summary.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeReportInputSchema = z.object({
  reportContent: z
    .string()
    .describe('The content of the completed tasks report to be summarized.'),
});
export type SummarizeReportInput = z.infer<typeof SummarizeReportInputSchema>;

const SummarizeReportOutputSchema = z.object({
  summary: z.string().describe('The AI-generated summary of the report.'),
});
export type SummarizeReportOutput = z.infer<typeof SummarizeReportOutputSchema>;

export async function summarizeReport(input: SummarizeReportInput): Promise<SummarizeReportOutput> {
  return summarizeReportFlow(input);
}

const summarizeReportPrompt = ai.definePrompt({
  name: 'summarizeReportPrompt',
  input: {schema: SummarizeReportInputSchema},
  output: {schema: SummarizeReportOutputSchema},
  prompt: `You are an AI assistant tasked with summarizing reports of completed tasks.

  Provide a concise and insightful summary of the following report.

  You MUST provide your response *only* as a valid JSON object that adheres to the defined output schema. Do not add any other text, explanation, or markdown formatting like \`\`\`json.

  Report Content:
  {{{reportContent}}}
  `,
});

const summarizeReportFlow = ai.defineFlow(
  {
    name: 'summarizeReportFlow',
    inputSchema: SummarizeReportInputSchema,
    outputSchema: SummarizeReportOutputSchema,
  },
  async input => {
    const {output} = await summarizeReportPrompt(input);
    if (!output) {
      throw new Error('The AI model failed to produce a valid response.');
    }
    return output;
  }
);
