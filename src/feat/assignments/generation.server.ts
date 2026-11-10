import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY!;
export const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

export const gemini = new GoogleGenAI({
  apiKey,
  httpOptions: {
    timeout: 2 * 60 * 1000,
    retryOptions: { attempts: 4, initialDelay: 2, maxDelay: 20 },
  },
});
