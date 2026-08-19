import { recommendationOrchestrator } from './src/modules/recommendation/recommendation.orchestrator.js';

async function testAnalysis(prompt, mode) {
  console.log(`\n==================================================`);
  console.log(`Analyzing: "${prompt}"`);
  
  // Call internal analyzePromptWithAI directly using bracket notation
  const analysis = await recommendationOrchestrator['analyzePromptWithAI'](prompt, mode);
  console.log('Analysis Result:', JSON.stringify(analysis, null, 2));
}

async function run() {
  await testAnalysis("I'm feeling stressed and want a comforting Kannada comedy movie.");
  await testAnalysis("I want a Korean or Japanese romantic movie under 2 hours with a hopeful ending.");
  await testAnalysis("Give me Hindi, Tamil and Malayalam action movies.");
  await testAnalysis("I want a mind-bending thriller but nothing extremely violent.");
}

run();
