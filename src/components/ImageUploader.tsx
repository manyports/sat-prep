"use client"

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { X, Upload, Image as ImageIcon, Clipboard, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { useUploadThing } from '@/lib/uploadthing'
import { generateClientDropzoneAccept } from 'uploadthing/client'

interface ImageUploaderProps {
  onImageAdded: (imageUrl: string, fileKey: string) => void
  className?: string
}

export function ImageUploader({ onImageAdded, className = '' }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadSuccessful, setUploadSuccessful] = useState(false)
  
  const { startUpload, isUploading } = useUploadThing("imageUploader")
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      await handleImageFile(file)
    }
  }, [])
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml']),
    maxFiles: 1,
    multiple: false
  })
  
  const handlePasteFromClipboard = useCallback(async () => {
    try {
      setIsLoading(true)
      const clipboardItems = await navigator.clipboard.read()
      
      for (const clipboardItem of clipboardItems) {
        const imageTypes = clipboardItem.types.filter(type => type.startsWith('image/'))
        
        if (imageTypes.length > 0) {
          const blob = await clipboardItem.getType(imageTypes[0])
          const file = new File([blob], `pasted-image-${Date.now()}.png`, { type: imageTypes[0] })
          await handleImageFile(file)
          break
        }
      }
    } catch (error) {
      console.error('Failed to read clipboard content:', error)
      alert('Failed to paste image from clipboard. Try copying an image first.')
      setIsLoading(false)
    }
  }, [])
  
  const handleImageFile = async (file: File) => {
    setIsLoading(true)
    setUploadSuccessful(false)
    let localPreview: string | null = null;
    
    try {
      localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);
      
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are supported');
      }
      
      console.log('Starting image upload to UploadThing:', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      });
      
      const uploadResult = await startUpload([file]);
      
      console.log('UploadThing response:', uploadResult);
      
      if (!uploadResult || !Array.isArray(uploadResult) || uploadResult.length === 0) {
        throw new Error('Upload failed: No result returned');
      }
      
      const uploadedFile = uploadResult[0];
      
      if (!uploadedFile || !uploadedFile.url) {
        throw new Error('Upload failed: Invalid response format');
      }
      
      console.log('Image uploaded successfully:', {
        url: uploadedFile.url,
        key: uploadedFile.key,
        size: uploadedFile.size
      });
      
      const fileKey = uploadedFile.key || `fallback-${Date.now()}`;
      
      setTimeout(() => {
        onImageAdded(uploadedFile.url, fileKey);
        
        setUploadSuccessful(true);
        
        console.log('Image callback triggered with:', {
          url: uploadedFile.url,
          key: fileKey
        });
      }, 100);
      
    } catch (error) {
      console.error('Image upload error:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown upload error';
      
      if (process.env.NODE_ENV === 'development') {
        alert(`Upload failed: ${errorMessage}\n\nCheck the console for more details.`);
      }
    } finally {
      setIsLoading(false);
      
      if (localPreview && !uploadSuccessful) {
        URL.revokeObjectURL(localPreview);
      }
    }
  }
  
  const clearImage = () => {
    setPreviewUrl(null)
    setUploadSuccessful(false)
  }
  
    useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (e.clipboardData?.files.length) {
        const file = e.clipboardData.files[0]
        if (file.type.startsWith('image/')) {
          e.preventDefault()
          await handleImageFile(file)
        }
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [])
  
  return (
    <div className={`relative ${className}`}>
      {previewUrl ? (
        <div className="relative">
          <img 
            src={previewUrl} 
            alt="Uploaded preview" 
            className="max-w-full h-auto rounded-md"
          />
          <button
            onClick={clearImage}
            className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full hover:bg-black"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
          
          {uploadSuccessful && (
            <div className="absolute bottom-2 right-2 bg-green-500/80 text-white px-2 py-1 rounded text-xs">
              Uploaded successfully
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-600">Drag & drop an image here or click to select</p>
              <span className="text-xs text-gray-500">JPG, PNG, GIF up to 10MB</span>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button
              onClick={handlePasteFromClipboard}
              variant="outline"
              className="text-xs flex items-center gap-2"
              disabled={isLoading || isUploading}
            >
              {(isLoading || isUploading) ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Clipboard className="h-4 w-4" />
              )}
              {(isLoading || isUploading) ? 'Uploading...' : 'Paste from clipboard'}
            </Button>
          </div>
        </div>
      )}
      
      {(isLoading || isUploading) && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="ml-2 text-blue-500 font-medium">Uploading image...</span>
        </div>
      )}
    </div>
  )
} 