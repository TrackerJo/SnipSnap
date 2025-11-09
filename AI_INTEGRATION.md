# AI Integration Guide

## Overview

SnipSnap uses AI to enhance task management by:
1. **Task Assessment & Rewriting**: Corrects spelling/grammar and makes tasks clearer
2. **Future: Image Verification**: Will verify task completion using computer vision

## Current Implementation: Gemini API

The app currently uses **Google Gemini API** (`gemini-pro` model) for task rewriting.

### Setup Instructions

1. **Get a Gemini API Key**
   - Visit: https://makersuite.google.com/app/apikey
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy your API key

2. **Configure in App**
   - Click the Settings icon (⚙️) in the top-right corner
   - Paste your Gemini API key
   - Click "Save Settings"

3. **Use AI Task Rewriting**
   - Click "Create New Task"
   - Type your task (can have typos, be vague, etc.)
   - Click the magic wand icon (🪄) next to the input
   - Review the AI-improved version
   - Accept or reject the suggestion

### Example

**User Input:**
```
go 2 gym and do some exercize
```

**AI Rewritten:**
```
Go to the gym and exercise for 30 minutes
```

## Future Implementation: Claude API

Code for Claude integration is already included (commented out) for easy switching.

### To Switch to Claude:

1. **Get a Claude API Key**
   - Visit: https://console.anthropic.com/
   - Create an account
   - Generate an API key

2. **Update Code** (in `src/utils/aiService.ts`):
   ```typescript
   // Uncomment the Claude import
   import Anthropic from '@anthropic-ai/sdk';
   
   // Uncomment the assessTaskWithClaude function
   export async function assessTaskWithClaude(taskText: string) { ... }
   
   // Update the assessAndRewriteTask function to use Claude
   if (provider === 'claude') {
     return await assessTaskWithClaude(taskText);
   }
   ```

3. **Configure in App**
   - Enter your Claude API key in Settings
   - The app will automatically detect and use it

## API Comparison

| Feature | Gemini Pro | Claude 3.5 Sonnet |
|---------|------------|-------------------|
| **Model** | gemini-pro | claude-3-5-sonnet-20241022 |
| **Max Tokens** | ~2048 | 100 (for task rewriting) |
| **Strengths** | Fast, free tier available | Superior reasoning, nuanced output |
| **Use Case** | Quick task improvements | Complex task analysis |
| **Cost** | Free tier: 60 requests/min | Pay-per-use |

## Security Notes

⚠️ **Important**: 
- API keys are stored in **browser localStorage** (client-side)
- Keys are obfuscated but NOT encrypted
- This is suitable for **demos and personal use only**

### For Production:

1. **Use a Backend Proxy**
   ```
   Client → Your Backend → AI API
   ```

2. **Never Expose Keys in Client Code**
   - Store keys in environment variables on your server
   - Use server-side API routes to call AI services
   - Send only sanitized responses to the client

3. **Rate Limiting**
   - Implement rate limiting on your backend
   - Prevent abuse of your API quota

## Future Features

### Image Verification (Coming Soon)

Will use:
- **Gemini Pro Vision** (`gemini-pro-vision`)
- **Claude 3.5 Sonnet** (with vision capabilities)

Example verification:
```typescript
// Task: "Go to the gym"
// User uploads: Photo of them at a gym
// AI Response: ✅ Verified - gym equipment visible, appears authentic
```

## Code Structure

```
src/
├── utils/
│   ├── apiKeyStorage.ts     # Secure storage utilities
│   └── aiService.ts          # AI API integration
├── components/
│   ├── SettingsDialog.tsx   # API key management UI
│   └── AddTodoDialog.tsx    # Task creation with AI
```

## Troubleshooting

### "API key not found" error
- Make sure you've entered your API key in Settings
- Check that the key is correct (no extra spaces)

### "Failed to assess task" error
- Check your internet connection
- Verify your API key is still valid
- Check API quota limits (Gemini free tier: 60 requests/min)

### AI returns same text
- The AI determined your task is already clear
- Try a more complex or unclear task description

## Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Claude API Documentation](https://docs.anthropic.com/)
- [SnipSnap GitHub](https://github.com/yourusername/snipsnap)
