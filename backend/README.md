# Findn AI Backend

Secure Node.js backend for the Findn AI browser extension. Keeps OpenAI API keys server-side for security.

## Features

- 🔒 **Secure API Key Storage**: OpenAI key stored in environment variables, never exposed to client
- 🚀 **Express.js Server**: Fast, lightweight REST API
- 🛡️ **Security Headers**: Helmet.js for security best practices
- 🌐 **CORS Enabled**: Configured for browser extension requests
- ⚡ **Error Handling**: Comprehensive error handling with specific OpenAI API error codes

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your OpenAI API key
OPENAI_API_KEY=sk-your-actual-openai-key-here
```

### 3. Start the Server
```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and timestamp.

### Profile Analysis
```
POST /analyze
Content-Type: application/json

{
  "profileData": {
    "platform": "linkedin",
    "name": "John Doe",
    "headline": "Software Engineer at Tech Corp",
    "jobTitle": "Senior Software Engineer",
    "company": "Tech Corp",
    "location": "San Francisco, CA",
    "interests": "JavaScript, React, Node.js",
    "recentActivity": "Posted about new project launch"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "connections": [
      {
        "title": "Tech Industry Leaders",
        "subtitle": "Connect with CTOs and senior engineers in similar companies",
        "link": ""
      }
    ],
    "communication_starters": [
      {
        "prompt": "Hi John! I saw your recent post about the project launch. I'd love to hear more about the technical challenges you overcame."
      }
    ],
    "interest_expansions": [
      {
        "topic": "Open Source Contributions",
        "why": "Contributing to React or Node.js projects could showcase your expertise and expand your network"
      }
    ]
  }
}
```

## Error Responses

### Missing API Key (500)
```json
{
  "success": false,
  "error": "Server misconfigured: API key missing"
}
```

### Invalid Request (400)
```json
{
  "success": false,
  "error": "Missing profileData in request body"
}
```

### Rate Limited (429)
```json
{
  "success": false,
  "error": "API rate limit exceeded. Please try again later."
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | ✅ Yes | Your OpenAI API key (starts with `sk-`) |
| `PORT` | ❌ No | Server port (default: 3000) |
| `NODE_ENV` | ❌ No | Environment mode (development/production) |

## Security Features

- **API Key Protection**: OpenAI key never exposed to browser
- **CORS Configuration**: Only allows browser extension origins
- **Request Validation**: Validates all incoming requests
- **Error Sanitization**: Doesn't leak sensitive error details
- **Helmet.js**: Adds security headers automatically

## Development

### Project Structure
```
backend/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── .env.example       # Environment template
├── .env              # Your environment variables (create this)
└── README.md         # This file
```

### Testing the API

1. **Start the server**: `npm run dev`
2. **Test health endpoint**:
   ```bash
   curl http://localhost:3000/health
   ```
3. **Test analysis endpoint**:
   ```bash
   curl -X POST http://localhost:3000/analyze \
     -H "Content-Type: application/json" \
     -d '{"profileData":{"platform":"linkedin","name":"Test User"}}'
   ```

## Deployment

### Local Development
- Use `npm run dev` for auto-restart on file changes
- Server runs on `http://localhost:3000`

### Production Deployment
- Set `NODE_ENV=production` in your environment
- Use `npm start` to run the server
- Consider using PM2 or similar process manager
- Set up reverse proxy (nginx) for HTTPS

### Environment Setup for Production
```bash
# Set your OpenAI API key
export OPENAI_API_KEY=sk-your-actual-key

# Set production port
export PORT=3000

# Set environment
export NODE_ENV=production
```

## Troubleshooting

### "API key missing" Error
- Check that `.env` file exists in the backend folder
- Verify `OPENAI_API_KEY` is set in `.env`
- Restart the server after changing `.env`

### CORS Errors
- The server is configured for browser extensions
- If testing from a web page, you may need to adjust CORS settings

### OpenAI API Errors
- **401**: Invalid API key
- **429**: Rate limit exceeded
- **403**: API access forbidden (check billing/permissions)

## License

MIT License - see LICENSE file for details.
