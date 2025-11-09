import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Camera, Upload, Scissors } from "lucide-react";
import { verifyTaskCompletion } from "../utils/aiService";
import { getActiveProvider } from "../utils/apiKeyStorage";
import heic2any from "heic2any";

interface CameraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (imageUrl: string) => void;
  onUpdateTask?: (newTaskText: string) => void;  // For incremental tasks
  taskText: string;
}

export function CameraDialog({ open, onOpenChange, onCapture, onUpdateTask, taskText }: CameraDialogProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    reason: string;
    confidence: number;
    updatedTask?: string;
    isIncremental?: boolean;
    isFullyComplete?: boolean;
    caption?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      let processedFile = file;

      // Check if the file is HEIC/HEIF format
      if (file.type === 'image/heic' || file.type === 'image/heif' ||
        file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
        try {
          // Convert HEIC to JPEG
          const convertedBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.9
          });

          // heic2any can return Blob or Blob[], handle both cases
          const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
          processedFile = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), {
            type: 'image/jpeg'
          });
        } catch (error) {
          console.error('Error converting HEIC image:', error);
          alert('Failed to convert HEIC image. Please try a different format.');
          setIsUploading(false);
          return;
        }
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(processedFile);
    }
  };

  const handleConfirm = async () => {
    if (capturedImage) {
      setIsVerifying(true);
      setVerificationResult(null);

      try {
        const provider = getActiveProvider() || 'gemini';
        const result = await verifyTaskCompletion(taskText, capturedImage, provider);
        setVerificationResult(result);
        // Don't auto-complete - let user review the verification result
      } catch (error) {
        console.error('Verification error:', error);
        // On error, show error message but don't auto-close
        setVerificationResult({
          verified: false,
          reason: error instanceof Error ? error.message : 'Failed to verify image',
          confidence: 0,
        });
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleCancel = () => {
    setCapturedImage(null);
    setVerificationResult(null);
    onOpenChange(false);
  };

  const handleCompleteTask = () => {
    // Complete task after successful verification or user override
    if (capturedImage && verificationResult) {
      // Check if this is an incremental task that's not fully complete
      if (verificationResult.isIncremental && !verificationResult.isFullyComplete && verificationResult.updatedTask && onUpdateTask) {
        // Update the task text with reduced count
        onUpdateTask(verificationResult.updatedTask);
        setCapturedImage(null);
        setVerificationResult(null);
        onOpenChange(false);
      } else {
        // Fully complete the task
        onCapture(capturedImage);
        setCapturedImage(null);
        setVerificationResult(null);
        onOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" style={{ color: '#A7C7E7' }} />
            Snap a Photo to Complete
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 rounded-lg border-2 border-dashed" style={{ backgroundColor: '#F0F7FF', borderColor: '#A7C7E7' }}>
            <p className="text-sm text-center" style={{ color: '#1F2937' }}>
              Task: <span className="font-semibold">{taskText}</span>
            </p>
          </div>

          {!capturedImage ? (
            <div className="space-y-3">
              <Button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full"
                size="lg"
                disabled={isUploading}
                style={{
                  backgroundColor: '#A7C7E7',
                  color: '#1F2937'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#7FB2E5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#A7C7E7';
                }}
              >
                {isUploading ? (
                  <>
                    <Scissors className="h-5 w-5 mr-2 animate-pulse" style={{ animation: 'scissors-cut 0.6s ease-in-out infinite' }} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Camera className="h-5 w-5 mr-2" />
                    Take Photo
                  </>
                )}
              </Button>

              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full"
                size="lg"
                disabled={isUploading}
                style={{
                  borderWidth: '2px',
                  borderColor: '#A7C7E7'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F0F9FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload Photo
              </Button>

              {/* Camera input - for taking photo directly */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* File input - for uploading existing photos */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.heic,.heif"
                onChange={handleFileUpload}
                className="hidden"
              />

              <p className="text-xs text-center text-muted-foreground">
                Take a new photo or upload an existing image to prove you completed this task
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden border-4" style={{ borderColor: '#A7C7E7' }}>
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-64 object-cover"
                />
              </div>

              <Button
                onClick={() => {
                  setCapturedImage(null);
                  setVerificationResult(null);
                }}
                variant="outline"
                className="w-full"
                disabled={isVerifying}
              >
                <Upload className="h-4 w-4 mr-2" />
                Retake Photo
              </Button>

              {verificationResult && !verificationResult.verified && (
                <div className="p-3 rounded-lg border-2" style={{
                  backgroundColor: '#FEF2F2',
                  borderColor: '#FCA5A5'
                }}>
                  <p className="text-sm font-semibold text-red-700 mb-1">
                    ⚠️ Verification Issue
                  </p>
                  <p className="text-xs text-red-600">
                    {verificationResult.reason}
                  </p>
                  <p className="text-xs text-red-500 mt-1">
                    Confidence: {Math.round(verificationResult.confidence * 100)}%
                  </p>
                </div>
              )}

              {verificationResult && verificationResult.verified && (
                <div className="p-3 rounded-lg border-2" style={{
                  backgroundColor: '#F0FDF4',
                  borderColor: '#86EFAC'
                }}>
                  <p className="text-sm font-semibold text-green-700 mb-1">
                    ✓ Task {verificationResult.isFullyComplete ? 'Verified!' : 'Progress Verified!'}
                  </p>
                  <p className="text-xs text-green-600">
                    {verificationResult.reason}
                  </p>
                  {verificationResult.caption && (
                    <p className="text-sm text-green-700 mt-2 font-medium italic border-t border-green-200 pt-2">
                      "{verificationResult.caption}"
                    </p>
                  )}
                  {verificationResult.isIncremental && !verificationResult.isFullyComplete && verificationResult.updatedTask && (
                    <p className="text-xs text-green-700 mt-2 font-semibold">
                      Updated task: "{verificationResult.updatedTask}"
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1"
                  disabled={isVerifying}
                >
                  Cancel
                </Button>

                {/* Show different buttons based on verification status */}
                {verificationResult ? (
                  verificationResult.verified ? (
                    // Verification successful - show Complete Task or Update Progress button
                    <Button
                      onClick={handleCompleteTask}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      disabled={isVerifying}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {verificationResult.isIncremental && !verificationResult.isFullyComplete
                        ? 'Update Progress'
                        : 'Complete Task'}
                    </Button>
                  ) : (
                    // Verification failed - show Accept Anyway button
                    <Button
                      onClick={handleCompleteTask}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      disabled={isVerifying}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Accept Anyway
                    </Button>
                  )
                ) : (
                  // No verification yet - show Verify button
                  <Button
                    onClick={handleConfirm}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <>
                        <Scissors className="h-4 w-4 mr-2" style={{ animation: 'scissors-cut 0.6s ease-in-out infinite' }} />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4 mr-2" />
                        Verify & Complete
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
