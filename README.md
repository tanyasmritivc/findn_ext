# Findn AI - Browser Extension

AI-powered networking insights for LinkedIn and Instagram profiles. Get instant suggestions for connections, conversation starters, and interest expansions.

## Features

- **Smart Profile Analysis**: Automatically scrapes and analyzes LinkedIn and Instagram profiles
- **Three AI-Powered Cards**:
  - 🤝 **Connections**: Suggestions for who this user might connect with and why
  - 💬 **Communication Starters**: Personalized openers/messages to start conversations
  - 🚀 **Interest Expansions**: Topics, communities, or opportunities to expand based on interests
- **Modern UI**: Clean, minimal design with Futura font and soft shadows
- **Copy to Clipboard**: Easy copying of AI-generated insights
- **Secure API Key Storage**: Your OpenAI API key is stored securely in the browser

## Installation

1. **Download the Extension Files**
   - Download all files from this repository
   - Keep the folder structure intact

2. **Load in Chrome/Edge**
   - Open Chrome or Edge browser
   - Go to `chrome://extensions/` (or `edge://extensions/`)
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `findnext` folder containing the extension files

3. **Configure API Key**
   - Click the Findn AI extension icon in your browser toolbar
   - Click the settings gear ⚙️ in the top right
   - Enter your OpenAI API key
   - Click "Save Settings"

## Getting an OpenAI API Key

1. Go to [OpenAI's website](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to the API section
4. Generate a new API key
5. Copy the key and paste it into the extension settings

## Usage

1. **Visit a Profile**
   - Navigate to any LinkedIn profile (e.g., `linkedin.com/in/username`)
   - Or visit any Instagram profile (e.g., `instagram.com/username`)

2. **Analyze Profile**
   - Click the Findn AI extension icon
   - Click "🔍 Analyze Profile" button
   - Wait for AI analysis to complete

3. **View Insights**
   - Browse the three insight cards:
     - **Connections**: See who they might want to connect with
     - **Communication Starters**: Get conversation starter ideas
     - **Interest Expansions**: Discover growth opportunities
   - Click "📋 Copy All" on any card to copy the content

## Supported Platforms

- ✅ LinkedIn (all profile pages)
- ✅ Instagram (all profile pages)

## Technical Details

### Files Structure
```
findnext/
├── manifest.json          # Extension configuration
├── background.js          # API communication & message handling
├── content.js            # Profile data scraping
├── popup.html            # Extension popup interface
├── popup.js              # Popup logic & UI interactions
├── style.css             # Modern styling
└── README.md             # This file
```

### Permissions
- `tabs` - Access to current tab information
- `activeTab` - Read content from active tab
- `scripting` - Inject content scripts
- `storage` - Store API keys and settings
- Host permissions for LinkedIn, Instagram, and OpenAI API

### API Integration
- Uses OpenAI GPT-3.5-turbo model
- Sends structured prompts with profile data
- Receives JSON responses with networking insights
- Includes fallback responses if API fails

## Privacy & Security

- **Local Processing**: Profile data is processed locally and sent only to OpenAI
- **Secure Storage**: API keys are stored in browser's secure storage
- **No Data Collection**: We don't collect or store any user data
- **Minimal Permissions**: Only requests necessary browser permissions

## Troubleshooting

### "Model provider unreachable" Error
- Check your internet connection
- Verify your OpenAI API key is correct
- Ensure your API key has sufficient credits
- Try again after a few minutes (rate limiting)

### Extension Not Working on Profile
- Make sure you're on a profile page (not feed/search)
- Refresh the page and try again
- Check that the platform is enabled in settings

### Profile Data Not Detected
- Some profiles may have privacy settings that limit data access
- Try different profiles to test functionality
- LinkedIn and Instagram frequently update their layouts

## Development

### Local Development
1. Make changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the Findn AI extension
4. Test your changes

### Adding New Platforms
1. Update `manifest.json` with new host permissions
2. Add platform detection in `content.js`
3. Implement scraping logic for the new platform
4. Update UI to show the new platform

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your API key is working with OpenAI directly
3. Try disabling other extensions that might interfere
4. Refresh the page and try again

## License

This project is for educational and personal use. Please respect the terms of service of LinkedIn, Instagram, and OpenAI when using this extension.
