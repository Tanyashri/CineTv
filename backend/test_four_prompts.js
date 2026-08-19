async function testPrompt(prompt, options = {}) {
  const url = 'http://localhost:4000/api/v1/recommendations/prepare';
  const body = { prompt, ...options };
  
  console.log(`\n==================================================`);
  console.log(`TESTING PROMPT: "${prompt}"`);
  console.log(`Options: ${JSON.stringify(options)}`);
  
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    console.log(`HTTP Status: ${res.status}`);
    const result = await res.json();
    const duration = Date.now() - start;
    console.log(`Time taken: ${duration}ms`);
    
    if (result.success && result.data) {
      console.log(`Detected Emotion: ${result.data.detectedEmotion}`);
      console.log(`Predicted Outcome: ${result.data.predictedOutcome}`);
      console.log(`Intent: ${result.data.intent}`);
      console.log(`Language Note: ${result.data.languageNote}`);
      console.log(`Resolved Region: ${result.data.resolvedRegion}`);
      console.log(`Movies Count: ${result.data.candidates?.length || 0}`);
      
      const movies = result.data.candidates || [];
      movies.forEach((c, idx) => {
        const m = c.movie;
        console.log(`  ${idx + 1}. [${m.original_language}] ${m.title} (${m.release_date?.substring(0, 4)}) - Score: ${c.recommendationScore}`);
        console.log(`     Reason: ${c.reasoning}`);
      });
    } else {
      console.log(`Failure:`, JSON.stringify(result));
    }
  } catch (err) {
    console.error(`Error:`, err.message || err);
  }
}

async function run() {
  // Test Prompt 1
  await testPrompt("I'm feeling stressed and want a comforting Kannada comedy movie.");
  
  // Test Prompt 2
  await testPrompt("I want a Korean or Japanese romantic movie under 2 hours with a hopeful ending.");
  
  // Test Prompt 3
  await testPrompt("Give me Hindi, Tamil and Malayalam action movies.");
  
  // Test Prompt 4
  await testPrompt("I want a mind-bending thriller but nothing extremely violent.");
}

run();
