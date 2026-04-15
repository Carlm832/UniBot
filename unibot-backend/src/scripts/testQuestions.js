const vectorService = require('../services/searchService');

const SUGGESTED_QUESTIONS = [
    // Admissions
    "How do I apply to NEU?",
    "What are the admission requirements?",
    "Tell me about tuition fees",
    "How do I get a student residence permit?",
    
    // Campus Navigation
    "Where is the International Students Office?",
    "Show me the Grand Library location",
    "Find the Near East Bank on campus",
    "Where is the Post Office?",
    
    // General
    "What student services are available?",
    "How can I contact the university?",
    "Tell me about NEU",
    "What faculties does NEU have?"
];

async function runTests() {
    await vectorService.initialize();
    
    console.log(`\n🧪 Running tests for ${SUGGESTED_QUESTIONS.length} suggested questions...\n`);
    
    const results = [];
    for (const question of SUGGESTED_QUESTIONS) {
        const hits = await vectorService.search(question, 1);
        const top = hits[0];
        
        console.log(`❓ Question: "${question}"`);
        if (top && top.score > 0) {
            console.log(`✅ Result: "${top.metadata.title}" (Score: ${top.score.toFixed(1)})`);
            results.push({ question, status: 'PASS', title: top.metadata.title });
        } else {
            console.log(`❌ Result: NO MATCH FOUND`);
            results.push({ question, status: 'FAIL' });
        }
        console.log('---');
    }
    
    const passed = results.filter(r => r.status === 'PASS').length;
    console.log(`\n📊 Summary: ${passed}/${results.length} Passed`);
    
    if (passed === results.length) {
        console.log('✨ All suggested questions are working correctly!');
    } else {
        console.log('⚠️ Some questions failed to find relevant data.');
    }
    
    process.exit(0);
}

runTests();
