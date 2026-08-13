import { env } from '../src/config/env.js';

async function testModels() {
  const apiKey = env.GEMINI_API_KEY;
  const prompt = "You are a film analysis engine. Analyze the user prompt and return JSON. User prompt: 'I feel happy.'";
  
  const models = ['gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-3.5-flash'];
  
  for (const model of models) {
    const start = Date.now();
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );
      
      const data = await response.json();
      console.log(`Model: ${model} - Status: ${response.status} - Time: ${Date.now() - start}ms`);
    } catch (err: any) {
      console.log(`Model: ${model} failed: ${err.message}`);
    }
  }
  process.exit(0);
}

testModels().catch(console.error);
