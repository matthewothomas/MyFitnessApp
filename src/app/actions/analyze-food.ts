'use server';

import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

const FoodAnalysisSchema = z.object({
    name: z.string().describe("The name of the main food item"),
    calories: z.number().describe("Estimated calories in kCal"),
    protein: z.number().describe("Estimated protein in grams"),
    carbs: z.number().describe("Estimated carbohydrates in grams"),
    fats: z.number().describe("Estimated fats in grams"),
});

export async function analyzeFoodAction(formData: FormData) {
    try {
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            return { error: 'Missing API Key' };
        }

        const file = formData.get('image') as File;
        if (!file) {
            return { error: 'No image provided' };
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString('base64');

        const result = await generateObject({
            model: google('gemini-1.5-flash'),
            schema: FoodAnalysisSchema,
            prompt: 'Analyze this food image. Estimate the nutritional content for the entire visible portion.',
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Analyze this food image. Estimate the nutritional content for the entire visible portion.' },
                        { type: 'image', image: base64Image }
                    ]
                }
            ]
        });

        return {
            data: result.object,
            success: true
        };

    } catch (error) {
        console.error('Error analyzing food:', error);
        return { error: 'Failed to analyze food. Try again.' };
    }
}
