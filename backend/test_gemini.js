import { env } from './src/config/env.js';

async function testModel(modelName) {
  const apiKey = env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  console.log(`Testing model: ${modelName}`);
  console.log(`URL: ${url}`);

  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Hello, respond with only one word.' }] }]
      })
    });
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    console.log('Data:', JSON.stringify(data));
  } catch (err) {
    console.error('Error:', err.message || err);
  }
  console.log(`Time taken: ${Date.now() - start}ms\n`);
}

async function run() {
  await testModel('gemini-3.5-flash');
  await testModel('gemini-1.5-flash');
}

run();
