import { env } from './src/config/env.js';

async function testModel(modelName) {
  const apiKey = env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  console.log(`Testing: ${modelName}...`);

  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Respond with exactly the word "Hello".' }] }]
      })
    });
    const duration = Date.now() - start;
    if (res.status === 200) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      console.log(`  -> SUCCESS! Duration: ${duration}ms, Answer: "${text}"`);
      return { modelName, duration, success: true };
    } else {
      console.log(`  -> FAILED: Status ${res.status}`);
      return { modelName, success: false };
    }
  } catch (err) {
    console.error(`  -> ERROR: ${err.message}`);
    return { modelName, success: false };
  }
}

async function run() {
  const models = [
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash',
    'gemini-3.6-flash',
    'gemini-3.7-flash'
  ];

  for (const m of models) {
    await testModel(m);
  }
}

run();
