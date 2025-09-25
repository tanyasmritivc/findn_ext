const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers

// More permissive CORS for Chrome extensions
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Findn AI Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Main analysis endpoint
app.post('/analyze', async (req, res) => {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY environment variable is not set');
      return res.status(500).json({
        success: false,
        error: 'Server misconfigured: API key missing'
      });
    }

    // Validate request body
    const { profileData } = req.body;
    if (!profileData) {
      return res.status(400).json({
        success: false,
        error: 'Missing profileData in request body'
      });
    }

    // Call OpenAI API
    const aiResponse = await callOpenAI(profileData, process.env.OPENAI_API_KEY);
    
    res.json({
      success: true,
      data: aiResponse
    });

  } catch (error) {
    console.error('Analysis error:', error);
    
    // Handle specific OpenAI API errors
    if (error.message.includes('401')) {
      return res.status(500).json({
        success: false,
        error: 'Invalid API key configuration'
      });
    } else if (error.message.includes('429')) {
      return res.status(429).json({
        success: false,
        error: 'API rate limit exceeded. Please try again later.'
      });
    } else if (error.message.includes('403')) {
      return res.status(500).json({
        success: false,
        error: 'API access forbidden. Check API key permissions.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to analyze profile. Please try again.'
    });
  }
});

// OpenAI API call function
async function callOpenAI(profileData, apiKey) {
  const prompt = buildPrompt(profileData);
  
  console.log('Calling OpenAI API with key:', apiKey ? `${apiKey.substring(0, 7)}...` : 'MISSING');
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'FindnAI-Backend/1.0'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that analyzes social media profiles and provides networking insights. Always respond with valid JSON in the exact format requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error Response:', errorText);
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI API');
    }
    
    const aiContent = data.choices[0].message.content;
    
    try {
      return JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', aiContent);
      throw new Error('AI returned invalid response format. Please try again.');
    }
  } catch (fetchError) {
    console.error('Network error calling OpenAI:', fetchError);
    
    if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError')) {
      throw new Error('Network error: Unable to reach OpenAI API');
    }
    
    throw fetchError;
  }
}

// Build prompt for OpenAI
function buildPrompt(profileData) {
  return `
Analyze this ${profileData.platform} profile and provide networking insights:

Profile Data:
- Name: ${profileData.name || 'Not available'}
- Headline/Bio: ${profileData.headline || 'Not available'}
- Job Title: ${profileData.jobTitle || 'Not available'}
- Company: ${profileData.company || 'Not available'}
- Location: ${profileData.location || 'Not available'}
- Interests/Skills: ${profileData.interests || 'Not available'}
- Recent Activity: ${profileData.recentActivity || 'Not available'}

Please respond with ONLY valid JSON in this exact format:
{
  "connections": [
    {"title": "Connection suggestion title", "subtitle": "Why this connection makes sense", "link": ""},
    {"title": "Another connection idea", "subtitle": "Reasoning for this connection", "link": ""},
    {"title": "Third connection suggestion", "subtitle": "Why they should connect", "link": ""}
  ],
  "communication_starters": [
    {"prompt": "Personalized conversation starter based on their profile"},
    {"prompt": "Another engaging way to start a conversation"},
    {"prompt": "Third conversation starter idea"}
  ],
  "interest_expansions": [
    {"topic": "Related interest or opportunity", "why": "Why this would be valuable for them"},
    {"topic": "Another expansion opportunity", "why": "How this connects to their current interests"},
    {"topic": "Third interest expansion", "why": "Why this would benefit their growth"}
  ]
}
`;
}


// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Findn AI Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Analysis endpoint: http://localhost:${PORT}/analyze`);
  
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  WARNING: OPENAI_API_KEY environment variable is not set!');
    console.warn('   Create a .env file with your OpenAI API key');
  } else {
    console.log('✅ OpenAI API key loaded successfully');
  }
});
