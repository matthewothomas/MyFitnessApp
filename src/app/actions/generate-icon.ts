'use server';

import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export async function generateIconAction(prompt: string) {
    try {
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            return { error: 'Missing API Key' };
        }

        const { text } = await generateText({
            model: google('gemini-1.5-flash'),
            prompt: `Generate a simple, minimal SVG icon for the following concept: "${prompt}". 
      Return ONLY the raw SVG string. Do not include markdown code blocks (like \`\`\`svg). 
      The SVG should be clean, use "currentColor" for stroke/fill where appropriate so it can be colored dynamically, have a transparent background, and be optimized for a small size (24x24 or 32x32 viewbox).`
        });

        // Clean up any potential markdown formatting just in case
        const cleanSvg = text.replace(/```svg/g, '').replace(/```/g, '').trim();

        return { svg: cleanSvg };
    } catch (error) {
        console.error('Error generating icon:', error);
        return { error: 'Failed to generate icon' };
    }
}
