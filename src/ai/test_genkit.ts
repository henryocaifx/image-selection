require('dotenv').config();
const { genkit } = require('genkit');
const { googleAI } = require('@genkit-ai/google-genai');

async function test() {
    const ai = genkit({
        plugins: [googleAI()],
    });

    try {
        const response = await ai.generate({
            model: 'googleai/gemini-1.5-flash',
            prompt: 'hi',
        });
        console.log('Gemini 1.5 Flash works:', response.text);
    } catch (e: any) {
        console.error('Gemini 1.5 Flash failed:', e.message);
    }
}

test();
