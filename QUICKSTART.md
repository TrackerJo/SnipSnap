# Quick Start Guide: AI-Powered Task Management

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Your AI API Key

#### Option A: Using the UI (Recommended)
1. Run the app: `npm run dev`
2. Click the **Settings icon (⚙️)** in the top-right corner
3. Enter your **Gemini API key**
4. Click **Save Settings**

#### Option B: Using Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and add your key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key
   ```

### 3. Get a Free Gemini API Key
- Visit: https://makersuite.google.com/app/apikey
- Sign in with Google
- Click "Create API Key"
- Copy and save your key

## ✨ Features

### AI Task Rewriting
The app uses AI to improve your task descriptions:

1. Click **"Create New Task"**
2. Type your task (typos are fine!)
   - Example: `go 2 gym and workout`
3. Click the **magic wand icon (🪄)**
4. Review the AI suggestion:
   - `Go to the gym and complete 30-minute workout`
5. **Accept** or **Reject** the suggestion

### What the AI Does:
- ✅ Fixes spelling and grammar
- ✅ Makes tasks clearer and more actionable
- ✅ Keeps tasks concise
- ✅ Maintains your original intent

## 🔐 Security

**Current Implementation (Demo/Personal Use):**
- API keys stored in browser localStorage
- Basic obfuscation (NOT encryption)
- Suitable for personal projects

**For Production:**
- ⚠️ Use a backend proxy to store API keys
- Never expose keys in client-side code
- Implement rate limiting

## 🔄 Switching to Claude (Future)

Code is ready for Claude integration:

1. Get a Claude API key from https://console.anthropic.com/
2. Uncomment Claude code in `src/utils/aiService.ts`:
   ```typescript
   // Line 2: Uncomment
   import Anthropic from '@anthropic-ai/sdk';
   
   // Lines 42-85: Uncomment the assessTaskWithClaude function
   
   // Line 95: Uncomment
   if (provider === 'claude') {
     return await assessTaskWithClaude(taskText);
   }
   ```
3. Enter Claude API key in Settings
4. Done! App will use Claude instead

## 📚 Documentation

- **AI Integration Guide**: See `AI_INTEGRATION.md`
- **API Reference**: See code comments in `src/utils/`

## 🐛 Troubleshooting

**"API key not found" error:**
- Check Settings to ensure key is saved
- Verify no extra spaces in the key

**"Failed to assess task" error:**
- Check internet connection
- Verify API key is valid
- Check API quota (Gemini free tier: 60 req/min)

**AI returns unchanged text:**
- Your task is already clear!
- Try a more complex/unclear task

## 🎯 Example Use Cases

| User Input | AI Output |
|------------|-----------|
| `go 2 gym` | `Go to the gym for 30 minutes` |
| `finish essay tommorrow` | `Complete essay by tomorrow` |
| `study math stuff` | `Study math for 45 minutes` |
| `clean room` | `Clean and organize bedroom` |

## 📝 Notes

- Gemini API is **free** with rate limits
- Claude API is **pay-per-use** (more advanced)
- Both APIs have excellent task rewriting capabilities
- Choose based on your needs and budget

Enjoy your AI-powered productivity! ✂️📸
