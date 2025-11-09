import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Scissors, Sparkles, Wand2, Check, X } from "lucide-react";
import { assessAndRewriteTask } from "../utils/aiService";
import { hasAPIKey, getActiveProvider } from "../utils/apiKeyStorage";
import { Alert, AlertDescription } from "./ui/alert";

interface AddTodoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (text: string, metadata?: {
    difficulty?: 'easy' | 'medium' | 'hard';
    estimatedMinutes?: number;
    urgency?: number;
    importance?: number;
  }) => void;
}

export function AddTodoDialog({ open, onOpenChange, onAdd }: AddTodoDialogProps) {
  const [todoText, setTodoText] = useState("");
  const [isAssessing, setIsAssessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiMetadata, setAiMetadata] = useState<{
    difficulty?: 'easy' | 'medium' | 'hard';
    estimatedMinutes?: number;
    urgency?: number;
    importance?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalText = aiSuggestion || todoText.trim();
    if (!finalText) return;

    // If we don't have metadata yet, get it from AI before submitting
    if (!aiMetadata) {
      const provider = getActiveProvider();
      if (provider && hasAPIKey(provider)) {
        setIsSubmitting(true);
        try {
          const result = await assessAndRewriteTask(finalText, provider);
          const metadata = {
            difficulty: result.difficulty,
            estimatedMinutes: result.estimatedMinutes,
            urgency: result.urgency,
            importance: result.importance,
          };
          onAdd(result.rewrittenTask || finalText, metadata);
        } catch (err) {
          console.error('Failed to get AI metadata:', err);
          // Still add the task even if AI fails
          onAdd(finalText);
        } finally {
          setIsSubmitting(false);
        }
      } else {
        // No API key, just add without metadata
        onAdd(finalText);
      }
    } else {
      // We already have metadata
      onAdd(finalText, aiMetadata);
    }

    setTodoText("");
    setAiSuggestion(null);
    setAiMetadata(null);
    setError(null);
    onOpenChange(false);
  };

  const handleAIRewrite = async () => {
    if (!todoText.trim()) return;

    const provider = getActiveProvider();
    if (!provider || !hasAPIKey(provider)) {
      setError("Please configure your AI API key in settings first.");
      return;
    }

    setIsAssessing(true);
    setError(null);

    try {
      const result = await assessAndRewriteTask(todoText.trim(), provider);
      setAiSuggestion(result.rewrittenTask);
      setAiMetadata({
        difficulty: result.difficulty,
        estimatedMinutes: result.estimatedMinutes,
        urgency: result.urgency,
        importance: result.importance,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assess task");
      setAiSuggestion(null);
    } finally {
      setIsAssessing(false);
    }
  };

  const handleAcceptSuggestion = () => {
    if (aiSuggestion) {
      setTodoText(aiSuggestion);
      setAiSuggestion(null);
    }
  };

  const handleRejectSuggestion = () => {
    setAiSuggestion(null);
  };

  const aiSuggestions = [
    "Go for a 30-minute walk",
    "Drink 8 glasses of water",
    "Read for 20 minutes",
    "Clean your workspace",
    "Do 10 push-ups",
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setTodoText(suggestion);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5" style={{ color: '#A7C7E7' }} />
            Create New Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task">What do you want to accomplish?</Label>
            <div className="flex gap-2">
              <Input
                id="task"
                placeholder="e.g., Go to the gym"
                value={todoText}
                onChange={(e) => setTodoText(e.target.value)}
                style={{
                  borderWidth: '2px',
                  borderColor: '#E5E7EB'
                }}
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-3"
                onFocus={(e) => e.currentTarget.style.outline = '2px solid #A7C7E7'}
                onBlur={(e) => e.currentTarget.style.outline = 'none'}
                autoFocus
              />
              <Button
                type="button"
                onClick={handleAIRewrite}
                disabled={!todoText.trim() || isAssessing}
                variant="outline"
                size="icon"
                style={{ borderWidth: '2px', borderColor: '#E5E7EB' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                title="Improve with AI"
              >
                {isAssessing ? (
                  <Scissors className="h-4 w-4" style={{ color: '#7FB2E5', animation: 'scissors-cut 0.6s ease-in-out infinite' }} />
                ) : (
                  <Wand2 className="h-4 w-4" style={{ color: '#7FB2E5' }} />
                )}
              </Button>
            </div>
          </div>

          {/* AI Suggestion Box */}
          {aiSuggestion && (
            <div className="p-3 rounded-lg space-y-2" style={{
              backgroundColor: '#F0F9FF',
              borderWidth: '2px',
              borderColor: '#A7C7E7'
            }}>
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#7FB2E5' }} />
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: '#1F2937' }}>AI Suggestion:</p>
                  <p className="text-sm mt-1" style={{ color: '#4B5563' }}>{aiSuggestion}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleAcceptSuggestion}
                  size="sm"
                  className="flex-1"
                  style={{
                    backgroundColor: '#A7C7E7',
                    color: '#1F2937'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7FB2E5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#A7C7E7'}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Accept
                </Button>
                <Button
                  type="button"
                  onClick={handleRejectSuggestion}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  style={{ borderColor: '#E5E7EB' }}
                >
                  <X className="h-3 w-3 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert style={{ borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }}>
              <AlertDescription className="text-sm" style={{ color: '#991B1B' }}>
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: '#7FB2E5' }} />
              <Label className="text-sm text-muted-foreground">Quick Add</Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {aiSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1 text-sm rounded-full transition-colors"
                  style={{
                    backgroundColor: '#F0F9FF',
                    borderWidth: '1px',
                    borderColor: '#A7C7E7',
                    color: '#1F2937'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#DBEAFE';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F0F9FF';
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              style={{ borderColor: '#E5E7EB' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!todoText.trim() || isSubmitting}
              className="flex-1"
              style={{
                backgroundColor: '#A7C7E7',
                color: '#1F2937'
              }}
              onMouseEnter={(e) => {
                if (!todoText.trim() || isSubmitting) return;
                e.currentTarget.style.backgroundColor = '#7FB2E5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#A7C7E7';
              }}
            >
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
