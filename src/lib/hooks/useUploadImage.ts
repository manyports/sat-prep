import { useState } from 'react';
import { useUploadThing } from '@/lib/uploadthing';

interface UploadResult {
  url: string;
  fileKey: string;
}

interface UploadImageHook {
  upload: (file: File) => Promise<UploadResult>;
  isUploading: boolean;
  error: Error | null;
  progress: number;
  reset: () => void;
}

export function useUploadImage(): UploadImageHook {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);
  
  const { startUpload, isUploading: uploadThingIsUploading } = useUploadThing('imageUploader', {
    onClientUploadComplete: () => {
      setProgress(100);
    },
    onUploadError: (error: Error) => {
      setError(error);
    },
    onUploadProgress: (progress: number) => {
      setProgress(progress);
    },
  });

  const reset = () => {
    setError(null);
    setProgress(0);
  };

  const upload = async (file: File): Promise<UploadResult> => {
    try {
      setIsUploading(true);
      setError(null);
      setProgress(0);
      
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are supported');
      }
      
      const result = await startUpload([file]);
      
      if (!result || result.length === 0) {
        throw new Error('Upload failed: No response from server');
      }
      
      const uploadedFile = result[0];
      
      return {
        url: uploadedFile.url,
        fileKey: uploadedFile.key,
      };
    } catch (err) {
      let errorMessage = 'Unknown upload error';
      
      if (err instanceof Error) {
        errorMessage = err.message;

        if (err.message.includes('NetworkError') || err.message.includes('network')) {
          errorMessage = 'Network error: Check your internet connection';
        }
        
        if (err.message.includes('500')) {
          errorMessage = 'Server error: The upload service is currently unavailable';
        }
      }
      
      const error = new Error(errorMessage);
      setError(error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    upload,
    isUploading: isUploading || uploadThingIsUploading,
    error,
    progress,
    reset,
  };
} 