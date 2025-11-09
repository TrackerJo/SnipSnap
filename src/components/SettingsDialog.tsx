import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Settings, Key, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { saveAPIKeys, getAPIKeys, clearAPIKeys, type APIKeys } from "../utils/apiKeyStorage";
import { Alert, AlertDescription } from "./ui/alert";

interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
    const [geminiKey, setGeminiKey] = useState("");
    const [claudeKey, setClaudeKey] = useState("");
    const [showGeminiKey, setShowGeminiKey] = useState(false);
    const [showClaudeKey, setShowClaudeKey] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (open) {
            const keys = getAPIKeys();
            setGeminiKey(keys.gemini || "");
            setClaudeKey(keys.claude || "");
            setSaved(false);
        }
    }, [open]);

    const handleSave = () => {
        const keys: APIKeys = {};

        if (geminiKey.trim()) {
            keys.gemini = geminiKey.trim();
        }

        if (claudeKey.trim()) {
            keys.claude = claudeKey.trim();
        }

        saveAPIKeys(keys);
        setSaved(true);

        setTimeout(() => {
            setSaved(false);
            onOpenChange(false);
        }, 1500);
    };

    const handleClear = () => {
        clearAPIKeys();
        setGeminiKey("");
        setClaudeKey("");
    };

    const hasKeys = geminiKey.trim() || claudeKey.trim();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" style={{ color: '#A7C7E7' }} />
                        API Settings
                    </DialogTitle>
                    <DialogDescription>
                        Configure your AI API keys for enhanced task management.
                        Keys are stored securely in your browser.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Gemini API Key */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="gemini-key" className="flex items-center gap-2">
                                <Key className="h-4 w-4" style={{ color: '#7FB2E5' }} />
                                Gemini API Key
                                <span className="text-xs text-green-600 font-semibold">(Active)</span>
                            </Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowGeminiKey(!showGeminiKey)}
                            >
                                {showGeminiKey ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <Input
                            id="gemini-key"
                            type={showGeminiKey ? "text" : "password"}
                            placeholder="Enter your Gemini API key"
                            value={geminiKey}
                            onChange={(e) => setGeminiKey(e.target.value)}
                            className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            Get your key from{" "}
                            <a
                                href="https://makersuite.google.com/app/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#7FB2E5' }}
                                className="hover:underline"
                            >
                                Google AI Studio
                            </a>
                        </p>
                    </div>

                    {/* Claude API Key (Future) */}
                    <div className="space-y-2 opacity-60">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="claude-key" className="flex items-center gap-2">
                                <Key className="h-4 w-4 text-orange-500" />
                                Claude API Key
                                <span className="text-xs text-muted-foreground">(Future Use)</span>
                            </Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowClaudeKey(!showClaudeKey)}
                            >
                                {showClaudeKey ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <Input
                            id="claude-key"
                            type={showClaudeKey ? "text" : "password"}
                            placeholder="Enter your Claude API key"
                            value={claudeKey}
                            onChange={(e) => setClaudeKey(e.target.value)}
                            className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            Get your key from{" "}
                            <a
                                href="https://console.anthropic.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-orange-600 hover:underline"
                            >
                                Anthropic Console
                            </a>
                        </p>
                    </div>

                    {/* Success Message */}
                    {saved && (
                        <Alert className="border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                API keys saved successfully!
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Warning about client-side storage */}
                    <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800 text-xs">
                            <strong>Security Notice:</strong> Keys are stored in your browser's local storage.
                            For production apps, use a secure backend to handle API keys.
                        </AlertDescription>
                    </Alert>
                </div>

                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClear}
                        disabled={!hasKeys}
                        className="flex-1"
                    >
                        Clear Keys
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={!hasKeys}
                        className="flex-1"
                        style={{
                            backgroundColor: '#A7C7E7',
                            color: '#1F2937'
                        }}
                        onMouseEnter={(e) => {
                            if (!hasKeys) return;
                            e.currentTarget.style.backgroundColor = '#7FB2E5';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#A7C7E7';
                        }}
                    >
                        Save Settings
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
