'use server';

/**
 * @fileOverview An AI agent that breaks down a high-level task description into smaller, more manageable subtasks.
 *
 * - breakdownTask - A function that handles the task breakdown process.
 * - BreakdownTaskInput - The input type for the breakdownTask function.
 * - BreakdownTaskOutput - The return type for the breakdownTask function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BreakdownTaskInputSchema = z.object({
  taskDescription: z
    .string()
    .describe('The detailed description of the task to be broken down into subtasks.'),
});
export type BreakdownTaskInput = z.infer<typeof BreakdownTaskInputSchema>;

const BreakdownTaskOutputSchema = z.object({
  subtasks: z
    .array(z.string())
    .describe('An array of subtasks derived from the main task description.'),
});
export type BreakdownTaskOutput = z.infer<typeof BreakdownTaskOutputSchema>;

export async function breakdownTask(input: BreakdownTaskInput): Promise<BreakdownTaskOutput> {
  return breakdownTaskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'breakdownTaskPrompt',
  input: {schema: BreakdownTaskInputSchema},
  output: {schema: BreakdownTaskOutputSchema},
  prompt: `You are an expert project manager. Your role is to take a high-level project description and break it down into a list of smaller, self-contained, and actionable task descriptions. Each item in the list should be a clear and concise description of a single task.

You MUST ONLY return a valid JSON object that strictly follows this schema: { "subtasks": ["First task description.", "Second task description.", ...] }.
Do not include any other text, comments, or markdown formatting like \`\`\`json.

Here is the project description to break down:
"{{{taskDescription}}}"
`,
});

const breakdownTaskFlow = ai.defineFlow(
  {
    name: 'breakdownTaskFlow',
    inputSchema: BreakdownTaskInputSchema,
    outputSchema: BreakdownTaskOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.subtasks || output.subtasks.length === 0) {
      throw new Error('The AI model failed to produce a valid task list. Please try again with a more descriptive task.');
    }
    return output;
  }
);
