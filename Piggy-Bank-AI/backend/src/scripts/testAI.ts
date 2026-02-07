import { aiService } from '../services/aiService.js';
import { prisma } from '../config/database.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testAI() {
  console.log('🤖 Testing Gemini AI Financial Coach...');
  
  try {
    // Get a test user
    const user = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    });

    if (!user) {
      console.log('❌ No test user found. Please run seed script first.');
      return;
    }

    console.log(`👤 Testing with user: ${user.email}`);
    
    // Test AI insights generation
    const insights = await aiService.generateFinancialInsights(user.id);
    
    console.log('✅ AI Insights Generated:');
    insights.forEach((insight, index) => {
      console.log(`\n${index + 1}. ${insight.title}`);
      console.log(`   Type: ${insight.type}`);
      console.log(`   Impact: ${insight.impact}`);
      if (insight.potentialSavings) {
        console.log(`   Potential Savings: $${insight.potentialSavings}`);
      }
      console.log(`   Description: ${insight.description}`);
    });

    console.log('\n🎉 AI Financial Coach test completed successfully!');
    
  } catch (error) {
    console.error('❌ AI test failed:', error);
    
    if (error.message?.includes('API_KEY')) {
      console.log('\n💡 To fix this:');
      console.log('1. Get your Gemini API key from: https://makersuite.google.com/app/apikey');
      console.log('2. Add it to your .env file: GEMINI_API_KEY="your-key-here"');
      console.log('3. Restart the backend server');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testAI();
