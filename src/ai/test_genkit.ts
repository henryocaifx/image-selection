
const { genkit } = require('genkit');
const { vertexAI } = require('@genkit-ai/google-genai');

async function test() {
    const ai = genkit({
        plugins: [vertexAI({ location: 'us-central1' })],
    });

    try {
        const response = await ai.generate({
            model: 'vertexai/gemini-1.5-flash',
            prompt: 'hi',
        });
        console.log('Gemini 1.5 Flash works:', response.text);
    } catch (e) {
        console.error('Gemini 1.5 Flash failed:', e.message);
    }

    try {
        const response = await ai.generate({
            model: 'vertexai/gemini-3.1-flash-image-preview',
            prompt: 'generate a red circle',
        });
        console.log('Gemini 3.1 Image works:', response.media?.url ? 'yes' : 'no');
    } catch (e) {
        console.error('Gemini 3.1 Image failed:', e.message);
    }
}

test();
