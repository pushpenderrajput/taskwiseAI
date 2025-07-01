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
  prompt: `You are an expert analyst. Your job is to create a concise, insightful summary of a list of completed tasks. The summary should highlight key achievements and potential trends.

You MUST ONLY return a valid JSON object that strictly follows this schema: { "summary": "Your summary here." }.
Do not include any other text, comments, or markdown formatting like \`\`\`json.

Here is the report content to summarize:
"{{{reportContent}}}"
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
    if (!output || !output.summary) {
      throw new Error('The AI model failed to produce a valid summary. Please ensure there are completed tasks in the selected period.');
    }
    return output;
  }
);
