import { env } from './src/config/env.js';

async function run() {
  const apiKey = env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  console.log(`Listing models via: ${url}`);

  try {
    const res = await fetch(url);
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    console.log('Available Models:');
    if (data.models) {
      data.models.forEach(m => {
        console.log(`- ${m.name} (supports: ${m.supportedGenerationMethods.join(', ')})`);
      });
    } else {
      console.log(JSON.stringify(data));
    }
  } catch (err) {
    console.error('Error:', err.message || err);
  }
}

run();
