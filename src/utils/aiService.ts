/**
 * AI Service for task assessment and rewriting
 * Supports both Gemini and Claude APIs
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
// import Anthropic from '@anthropic-ai/sdk';
import { getAPIKeys, type AIProvider } from './apiKeyStorage';

export interface TaskAssessmentResult {
  originalTask: string;
  rewrittenTask: string;
  suggestions?: string[];
  confidence?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedMinutes?: number;
  urgency?: number; // 1-10 scale
  importance?: number; // 1-10 scale
}

/**
 * Assess and rewrite a task using Gemini AI
 */
export async function assessTaskWithGemini(taskText: string): Promise<TaskAssessmentResult> {
  const keys = getAPIKeys();

  if (!keys.gemini) {
    throw new Error('Gemini API key not found. Please add your API key in settings.');
  }

  try {
    const genAI = new GoogleGenerativeAI(keys.gemini);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const prompt = `You are a productivity assistant. A user has entered the following task:

"${taskText}"

Your job is to:
1. Correct any spelling or grammar mistakes
2. Make it clear and actionable
3. Keep it concise (under 100 characters if possible)
4. Maintain the user's original intent
5. Assess the difficulty, time estimate, urgency, and importance

Respond in JSON format:
{
  "rewrittenTask": "The improved task text",
  "difficulty": "easy" or "medium" or "hard",
  "estimatedMinutes": number (realistic time estimate),
  "urgency": number 1-10 (how time-sensitive is this? 10 = must do today),
  "importance": number 1-10 (how impactful is this? 10 = life-changing)
}

Examples:
- "Drink water" → difficulty: easy, estimatedMinutes: 2, urgency: 3, importance: 6
- "Go to gym" → difficulty: medium, estimatedMinutes: 90, urgency: 5, importance: 8
- "Submit tax returns" → difficulty: hard, estimatedMinutes: 180, urgency: 10, importance: 10`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    // Parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          originalTask: taskText,
          rewrittenTask: parsed.rewrittenTask || taskText,
          difficulty: parsed.difficulty || 'medium',
          estimatedMinutes: parsed.estimatedMinutes || 30,
          urgency: parsed.urgency || 5,
          importance: parsed.importance || 5,
          confidence: 0.9,
        };
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e);
    }

    // Fallback if JSON parsing fails
    return {
      originalTask: taskText,
      rewrittenTask: text || taskText,
      difficulty: 'medium',
      estimatedMinutes: 30,
      urgency: 5,
      importance: 5,
      confidence: 0.9,
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to assess task with Gemini. Please check your API key and try again.');
  }
}

/**
 * Assess and rewrite a task using Claude AI
 * (Currently commented out - uncomment when switching to Claude)
 */
/*
export async function assessTaskWithClaude(taskText: string): Promise<TaskAssessmentResult> {
  const keys = getAPIKeys();
  
  if (!keys.claude) {
    throw new Error('Claude API key not found. Please add your API key in settings.');
  }
  
  try {
    const anthropic = new Anthropic({
      apiKey: keys.claude,
      // dangerouslyAllowBrowser: true is required for client-side usage
      // In production, you should use a backend proxy
      dangerouslyAllowBrowser: true,
    });
    
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `You are a productivity assistant. A user has entered the following task:

"${taskText}"

Your job is to:
1. Correct any spelling or grammar mistakes
2. Make it clear and actionable
3. Keep it concise (under 100 characters if possible)
4. Maintain the user's original intent

Respond ONLY with the improved task text, nothing else. No explanations, no quotes, just the corrected task.`
        }
      ]
    });
    
    const rewrittenTask = message.content[0].type === 'text' 
      ? message.content[0].text.trim() 
      : taskText;
    
    return {
      originalTask: taskText,
      rewrittenTask: rewrittenTask || taskText,
      confidence: 0.9,
    };
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('Failed to assess task with Claude. Please check your API key and try again.');
  }
}
*/

/**
 * Unified task assessment function that uses the active AI provider
 */
export async function assessAndRewriteTask(
  taskText: string,
  provider: AIProvider = 'gemini'
): Promise<TaskAssessmentResult> {
  // Currently using Gemini
  if (provider === 'gemini') {
    return await assessTaskWithGemini(taskText);
  }

  // Uncomment when switching to Claude
  /*
  if (provider === 'claude') {
    return await assessTaskWithClaude(taskText);
  }
  */

  throw new Error(`Unsupported AI provider: ${provider}`);
}

/**
 * Verify task completion using AI with image analysis
 * For incremental tasks, returns the updated task text with reduced count
 */
export async function verifyTaskCompletion(
  taskText: string,
  imageBase64: string,
  provider: AIProvider = 'gemini'
): Promise<{
  verified: boolean;
  reason: string;
  confidence: number;
  updatedTask?: string;  // For incremental tasks
  isIncremental?: boolean;  // Whether this is an incremental task
  isFullyComplete?: boolean;  // Whether the entire task is done
  caption?: string;  // Motivational caption for completed task
}> {
  const keys = getAPIKeys();

  if (provider === 'gemini') {
    if (!keys.gemini) {
      throw new Error('Gemini API key not found. Please add your API key in settings.');
    }

    try {
      const genAI = new GoogleGenerativeAI(keys.gemini);
      // Use Gemini Pro Vision for image analysis
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

      // Remove data URL prefix if present
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const prompt = `You are a task verification assistant. A user has completed (or partially completed) the following task:

"${taskText}"

They have provided an image as proof of completion. Analyze the image and determine:
1. If it shows evidence of task progress/completion
2. If this is an INCREMENTAL task (e.g., "drink 6 glasses of water", "do 20 push-ups", "read 3 chapters")
3. For incremental tasks: how many units were completed in this image vs. how many remain

For INCREMENTAL tasks (tasks with numbers/quantities):
- If the image shows partial completion (e.g., 1 glass of water when task is 6 glasses), verify it and provide the UPDATED task with reduced count
- Example: Task "Drink 6 glasses of water" + image shows 1 glass → updatedTask: "Drink 5 glasses of water"
- Example: Task "Do 20 push-ups" + image shows person doing push-ups → updatedTask: "Do 10 push-ups" (estimate based on image)

For NON-incremental tasks:
- Verify if the task is completed or not

Respond in JSON format with:
{
  "verified": true or false (true if image shows ANY progress toward the task),
  "reason": "Brief explanation of what you see in the image",
  "confidence": a number between 0 and 1,
  "isIncremental": true or false (is this a countable/incremental task?),
  "isFullyComplete": true or false (is the ENTIRE task done, or just partial?),
  "updatedTask": "The task with reduced count" (ONLY for incremental tasks that are not fully complete, otherwise omit this field),
  "caption": "A short, motivational 1-sentence caption celebrating what they accomplished (be specific and encouraging!)"
}

Caption examples:
- For gym: "Crushed that workout! Your dedication is inspiring 💪"
- For reading: "Another chapter conquered! Knowledge is power 📚"
- For water: "Hydration hero! Keep up the healthy habits 💧"

Be reasonable and lenient - if the image shows any relevant evidence of progress, verify it. Only reject if clearly unrelated.`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Data,
          },
        },
      ]);

      const response = await result.response;
      const text = response.text();

      // Parse the JSON response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            verified: parsed.verified ?? true,
            reason: parsed.reason || 'Task verification completed',
            confidence: parsed.confidence ?? 0.7,
            updatedTask: parsed.updatedTask,
            isIncremental: parsed.isIncremental ?? false,
            isFullyComplete: parsed.isFullyComplete ?? true,
            caption: parsed.caption || 'Great job completing this task!',
          };
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
      }

      // Fallback: if we can't parse, assume verified
      return {
        verified: true,
        reason: 'Image uploaded successfully',
        confidence: 0.6,
        isFullyComplete: true,
        caption: 'Task completed successfully!',
      };
    } catch (error) {
      console.error('Gemini vision API error:', error);
      throw new Error('Failed to verify task with AI. Please try again.');
    }
  }

  // Fallback for unsupported providers
  return {
    verified: true,
    reason: 'AI verification not available for this provider',
    confidence: 0.5,
    isFullyComplete: true,
  };
}
