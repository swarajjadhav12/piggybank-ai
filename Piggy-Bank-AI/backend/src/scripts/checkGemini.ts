import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkGeminiAPI() {
  console.log('🔑 Checking Gemini API Key...');
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ GEMINI_API_KEY not found in environment variables');
    console.log('💡 Please add GEMINI_API_KEY to your .env file');
    return;
  }
  
  if (apiKey === 'your-gemini-api-key-here') {
    console.log('❌ GEMINI_API_KEY is still set to placeholder value');
    console.log('💡 Please replace with your actual Gemini API key');
    return;
  }
  
  console.log('✅ GEMINI_API_KEY found in environment');
  console.log(`🔑 Key starts with: ${apiKey.substring(0, 10)}...`);
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent('Hello, can you respond with "API working"?');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Gemini API is working!');
    console.log(`🤖 Response: ${text}`);
    
  } catch (error) {
    console.log('❌ Gemini API test failed:');
    console.error(error);
    
    if (error.message?.includes('API_KEY_INVALID')) {
      console.log('💡 Your API key appears to be invalid. Please check it at: https://makersuite.google.com/app/apikey');
    } else if (error.message?.includes('QUOTA_EXCEEDED')) {
      console.log('💡 You have exceeded your API quota. Please check your usage limits.');
    } else {
      console.log('💡 Please check your internet connection and API key validity.');
    }
  }
}

checkGeminiAPI();
