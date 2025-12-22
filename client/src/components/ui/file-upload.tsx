import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';

interface FileUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  endpoint: 'image' | 'logo' | 'banner';
  accept?: string;
  maxSize?: number; // in MB
  width?: number;
  height?: number;
  className?: string;
  hideUrlInput?: boolean;
}

export function FileUpload({
  label,
  value,
  onChange,
  endpoint,
  accept = "image/*",
  maxSize = 10,
  width = 300,
  height = 200,
  className = "",
  hideUrlInput = false
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append(endpoint, file);

      const response = await fetch(`/api/upload/${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      onChange(data.url);
      toast({
        title: "File uploaded",
        description: "Image uploaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Maximum size: ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <Label className="block text-sm font-medium mb-2">{label}</Label>
      
      {value ? (
        <div className="relative group" style={{ maxWidth: width }}>
          <img
            src={value}
            alt={label}
            className="rounded-lg border object-cover w-full"
            style={{ maxWidth: '100%', height: 'auto', maxHeight: height }}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
          >
            <X size={16} />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors w-full ${
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          style={{ maxWidth: width, minHeight: height }}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploadMutation.isPending ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                Drag image or click to select
              </p>
              <p className="text-xs text-gray-500">
                Maximum {maxSize}MB
              </p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      {!hideUrlInput && (
        <div className="mt-2">
          <Input
            type="url"
            placeholder="Or enter image URL"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={uploadMutation.isPending}
          />
        </div>
      )}
    </div>
  );
}