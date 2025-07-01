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
  tasks: z.array(z.object({
    title: z.string().describe("The Account/Project name for the task."),
    description: z.string().optional().describe("The detailed description of the task."),
    accountManager: z.string().optional().describe("The name of the account manager for the task."),
    priority: z.string().describe("The priority of the task (Low, Medium, High)."),
    completedAt: z.string().describe("The ISO date string of when the task was completed."),
  })).describe("A list of completed tasks."),
  startDate: z.string().describe("The start date of the reporting period in 'MM/DD/YYYY' format."),
  endDate: z.string().describe("The end date of the reporting period in 'MM/DD/YYYY' format."),
});
export type SummarizeReportInput = z.infer<typeof SummarizeReportInputSchema>;

const SummarizeReportOutputSchema = z.object({
  summary: z.string().describe('The AI-generated summary of the report, formatted with markdown for sections and bolding.'),
});
export type SummarizeReportOutput = z.infer<typeof SummarizeReportOutputSchema>;

export async function summarizeReport(input: SummarizeReportInput): Promise<SummarizeReportOutput> {
  return summarizeReportFlow(input);
}

const summarizeReportPrompt = ai.definePrompt({
  name: 'summarizeReportPrompt',
  input: {schema: SummarizeReportInputSchema},
  output: {schema: SummarizeReportOutputSchema},
  prompt: `You are an expert analyst. Your job is to create an insightful summary of a list of completed tasks.
The user's account/project is in the 'title' field, and the specific task is in the 'description' field.

Generate a report summary based on the following data:
- Reporting Period: {{startDate}} to {{endDate}}
- Completed Tasks Details: {{json tasks}}

Your summary MUST follow this structure and tone exactly, using markdown for bolding and newlines for spacing:

"Here is a brief analysis of your activity report for the period {{startDate}} - {{endDate}}:

**Summary & Key Metrics**
This report covers the reporting period. During this time, your **Total Tasks Completed** stands at **{{tasks.length}}**.
[Mention one or two key completions, for example: 'This includes the "Task Description" task for the "Account/Project" account recorded on its completion date.']

**Observations & Suggestions**
[Analyze the activity. Mention which accounts/projects are most active. Mention which account managers are most active. For example: 'Activity was concentrated on the X account, handled by John D.' or 'Activity was low during this period.' Provide actionable suggestions. For example: 'To gain meaningful insights, consider logging tasks more consistently to build a comprehensive dataset.']"

You MUST ONLY return a valid JSON object that strictly follows this schema: { "summary": "Your detailed summary here, including the sections and markdown." }.
Do not include any other text, comments, or markdown formatting like \`\`\`json.
`,
});

const summarizeReportFlow = ai.defineFlow(
  {
    name: 'summarizeReportFlow',
    inputSchema: SummarizeReportInputSchema,
    outputSchema: SummarizeReportOutputSchema,
  },
  async input => {
    if (input.tasks.length === 0) {
        return {
          summary: `No tasks were completed during the period ${input.startDate} - ${input.endDate}. Start completing tasks to generate a report.`
        };
      }

    const {output} = await summarizeReportPrompt(input);
    if (!output || !output.summary) {
      throw new Error('The AI model failed to produce a valid summary. Please ensure there are completed tasks in the selected period.');
    }
    return output;
  }
);
