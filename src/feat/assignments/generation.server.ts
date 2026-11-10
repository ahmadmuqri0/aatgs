import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import z from 'zod';

const apiKey = process.env.GEMINI_API_KEY!;
export const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

const seconds = (start: number) => ((performance.now() - start) / 1000).toFixed(1);

// logs every HTTP attempt, so retries and timeouts show up in the console
async function loggedFetch(input: RequestInfo | URL, init?: RequestInit) {
  const start = performance.now();
  try {
    const response = await fetch(input, init);
    console.log(`[gemini] attempt → ${response.status} in ${seconds(start)}s`);
    return response;
  } catch (error) {
    const reason = error instanceof Error ? error.name : 'error';
    console.log(`[gemini] attempt → ${reason} after ${seconds(start)}s`);
    throw error;
  }
}

const gemini = new GoogleGenAI({
  apiKey,
  httpOptions: {
    timeout: 2 * 60 * 1000,
    retryOptions: { attempts: 4, initialDelay: 2, maxDelay: 20 },
    fetch: loggedFetch,
  },
});

const generatedTasksSchema = z.object({
  tasks: z
    .array(
      z.object({
        title: z
          .string()
          .trim()
          .min(1)
          .describe('Short imperative step, e.g. "Draft the introduction"'),
        description: z
          .string()
          .trim()
          .describe('What to do in this step and what counts as done, based on the brief'),
      }),
    )
    .describe('Ordered steps; empty if the document is not an assignment brief'),
});

const SYSTEM_INSTRUCTION = `
You turn a student's assignment brief into a step-by-step task list they can follow to complete the assignment.

Rules:
- Cover every numbered or bulleted requirement in the brief with a task. Merge trivial requirements together and split large ones into steps.
- Make each task concrete and actionable, small enough to finish in one sitting.
- Follow the order of the brief, unless a step depends on one that comes later.
- Put sub-requirements (bullet points under a requirement) in that task's description instead of making separate tasks.
- Give each task a clear, concise title and a description of what to do and what counts as done.
- Cover every deliverable and marking criterion stated in the brief.
- Only use requirements stated in the brief; do not invent word counts, formats, tools or deadlines.
- Finish with reviewing the work against the brief and submitting it as the brief instructs.
- If the document is not an assignment brief, return an empty task list.`;

/** Sends an assignment brief PDF to Gemini and returns the validated, ordered tasks; throws on any failure. */
export async function generateTasks(pdf: Buffer) {
  const start = performance.now();
  const response = await gemini.models.generateContent({
    model: geminiModel,
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'application/pdf', data: pdf.toString('base64') } },
          { text: 'Break this assignment brief into tasks.' },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseJsonSchema: z.toJSONSchema(generatedTasksSchema),
    },
  });

  const usage = response.usageMetadata;
  console.log(
    `[gemini] ${geminiModel} done in ${seconds(start)}s — tokens: ` +
      `input ${usage?.promptTokenCount ?? '?'}, thinking ${usage?.thoughtsTokenCount ?? 0}, ` +
      `output ${usage?.candidatesTokenCount ?? '?'}, total ${usage?.totalTokenCount ?? '?'}`,
  );

  if (!response.text) {
    throw new Error('Gemini returned an empty response');
  }

  const { tasks } = generatedTasksSchema.parse(JSON.parse(response.text));

  if (tasks.length === 0) {
    throw new Error('The uploaded file does not look like an assignment brief');
  }

  return tasks;
}
