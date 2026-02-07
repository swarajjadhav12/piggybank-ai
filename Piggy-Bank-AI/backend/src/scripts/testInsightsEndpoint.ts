import { prisma } from '../config/database.js';
import { aiService } from '../services/aiService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testInsightsEndpoint() {
  console.log('🧪 Testing Insights Endpoint...');
  
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
    
    // Test the AI service directly
    console.log('🤖 Testing AI service...');
    const insights = await aiService.generateFinancialInsights(user.id);
    console.log(`✅ Generated ${insights.length} insights`);
    
    // Test creating insights in database
    console.log('💾 Testing database creation...');
    const createdInsights = await Promise.all(
      insights.map(insight =>
        prisma.aIInsight.create({
          data: {
            ...insight,
            userId: user.id,
          },
        })
      )
    );
    
    console.log(`✅ Created ${createdInsights.length} insights in database`);
    
    // Test the full endpoint logic
    console.log('🔗 Testing full endpoint logic...');
    const response = {
      success: true,
      data: createdInsights,
      message: `Generated ${createdInsights.length} AI-powered insights`,
    };
    
    console.log('✅ Endpoint logic successful!');
    console.log('📊 Response:', JSON.stringify(response, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testInsightsEndpoint();
